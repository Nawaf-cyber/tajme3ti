import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';

// أقصى مدة مسموحة في Vercel
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. التحقق من حالة المفتاح في قاعدة البيانات
    const setting = await prisma.systemSetting.findUnique({ where: { id: "default" } });
    const isCronEnabled = setting ? setting.cronEnabled : false;

    if (!isCronEnabled) {
      return NextResponse.json({ message: "التحديث التلقائي معطل حالياً من لوحة التحكم." }, { status: 200 });
    }

    const SCRAPER_API_KEY = "cbefd79855776832088f89e006209b25";
    
    // 2. سحب أقدم 10 قطع لم يتم تحديثها لتجنب Timeout
    const components = await prisma.component.findMany({
      where: { 
        OR: [
          { amazonUrl: { contains: "http" } },
          { cazasouqUrl: { contains: "http" } },
          { microlessUrl: { contains: "http" } }
        ]
      },
      orderBy: { updatedAt: 'asc' }, // الترتيب تصاعدياً (الأقدم أولاً)
      take: 10
    });

    let updatedCount = 0;
    let updatedItems: { name: string; storeLinks: string[] }[] = []; 

    // 3. حلقة السحب والتحديث
    for (const comp of components) {
      let finalAmazonPrice = comp.amazonPrice || Infinity;
      let finalCazasouqPrice = comp.cazasouqPrice || Infinity;
      let finalMicrolessPrice = comp.microlessPrice || Infinity;

      let amazonInStock = comp.amazonInStock ?? true;
      let cazasouqInStock = comp.cazasouqInStock ?? true;
      let microlessInStock = comp.microlessInStock ?? true;

      // تحديث أمازون
      if (comp.amazonUrl) {
        try {
          const targetUrl = encodeURIComponent(comp.amazonUrl);
          const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&premium=true&country_code=sa`;
          const res = await fetch(url, { cache: 'no-store' });
          
          if (res.ok) {
            const html = await res.text();
            const $ = cheerio.load(html);
            
            const amzAvailability = $('#availability').text().toLowerCase();
            if (amzAvailability.includes('currently unavailable') || amzAvailability.includes('غير متوفر') || amzAvailability.includes('لا يتوفر')) {
              amazonInStock = false;
            } else {
              amazonInStock = true;
            }

            let priceText = $('#corePriceDisplay_desktop_feature_div .a-price-whole').first().text();
            if (!priceText) priceText = $('#corePrice_feature_div .a-price-whole').first().text();
            if (!priceText) priceText = $('.apexPriceToPay .a-offscreen').first().text();
            if (!priceText) priceText = $('#priceblock_ourprice').text();
            if (!priceText) priceText = $('.a-price[data-a-size="xl"] .a-offscreen').first().text();
            
            const cleanedPrice = parseFloat(priceText.replace(/,/g, '').replace(/[^0-9.]/g, ''));
            if (!isNaN(cleanedPrice) && cleanedPrice > 0) {
              finalAmazonPrice = cleanedPrice;
            }
          }
        } catch (e) {
          // تجاهل
        }
      }

      // تحديث كازاسوق
      // 2. تحديث كازاسوق
      if (comp.cazasouqUrl) {
        try {
          const targetUrl = encodeURIComponent(comp.cazasouqUrl);
          const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&premium=true&country_code=sa`;
          const res = await fetch(url, { cache: 'no-store' });
          
          if (res.ok) {
            const html = await res.text();
            const $ = cheerio.load(html);
            
            // -- 1. فحص التوفر --
            const hasAddToCartBtn = $('#button-cart').length > 0 || 
                                    $('button, a').filter(function() {
                                      const text = $(this).text().trim();
                                      return text === 'اضافة للسلة' || text === 'أضف للسلة' || text === 'اشتر الآن';
                                    }).length > 0;

            const isOutOfStockExplicit = $('button, span, div').filter(function() {
               const text = $(this).text().trim();
               return text === 'نفدت الكمية' || text === 'غير متوفر';
            }).length > 0;

            if (hasAddToCartBtn) {
              cazasouqInStock = true;
            } else if (isOutOfStockExplicit) {
              cazasouqInStock = false;
            } else {
              cazasouqInStock = html.includes('اضافة للسلة') || html.includes('اشتر الآن');
            }

            // -- 2. فحص السعر بدقة (تم التحديث هنا لتجنب التقاط 170) --
            // نستهدف حصرياً القسم الذي يحتوي على معلومات المنتج الأساسية
            let productContainer = $('#product, .product-info, .product-details').first();
            
            // إذا لم يجد القسم المحدد، يبحث في كامل الصفحة كإجراء احتياطي
            if (productContainer.length === 0) productContainer = $('body');

            let priceText = productContainer.find('.price-new').first().text();
            if (!priceText) priceText = productContainer.find('h2').filter(function() { return $(this).text().includes('ر.س') || $(this).text().includes('SAR'); }).first().text();
            if (!priceText) priceText = productContainer.find('.product-price, .price-normal').first().text();

            let cleanedPrice = parseFloat(priceText.replace(/,/g, '').replace(/[^0-9.]/g, ''));

            const isBHD = priceText.toLowerCase().includes('bhd') || priceText.includes('د.ب') || priceText.toLowerCase().includes('bd');
            if (isBHD) {
              cleanedPrice = cleanedPrice * 10;
            } else if (cleanedPrice > 0) {
              const amzPriceForComparison = finalAmazonPrice !== Infinity ? finalAmazonPrice : (comp.amazonPrice || 0);
              // تصحيح السعر إذا كان أصغر من 20% من سعر أمازون (احتمال أنه سحب سعر خاطئ)
              if (amzPriceForComparison > 0 && cleanedPrice < (amzPriceForComparison * 0.2)) {
                cleanedPrice = cleanedPrice * 10;
              }
            }

            // الحماية الأخيرة: إذا كان السعر المستخرج 170 (وهو رقم الشذوذ الذي ظهر)، نتجاهله
            if (!isNaN(cleanedPrice) && cleanedPrice > 0 && cleanedPrice !== 170) {
              finalCazasouqPrice = parseFloat(cleanedPrice.toFixed(2));
            } else if (cleanedPrice === 170) {
               // محاولة أخيرة للبحث عن السعر الحقيقي إذا التقط 170
               let alternativePriceText = $('h2').filter(function() { return $(this).text().includes('ر.س') && !$(this).text().includes('170'); }).first().text();
               let alternativeCleanedPrice = parseFloat(alternativePriceText.replace(/,/g, '').replace(/[^0-9.]/g, ''));
               if (!isNaN(alternativeCleanedPrice) && alternativeCleanedPrice > 0) {
                   finalCazasouqPrice = alternativeCleanedPrice;
               }
            }

          }
        } catch (e) {
          // تجاهل في ملف الشامل
        }
      }

      // تحديث مايكروليس
      if (comp.microlessUrl) {
        try {
          const targetUrl = encodeURIComponent(comp.microlessUrl);
          // premium و country_code=sa ضرورية لمنع الموقع من تغيير العملة للدرهم الإماراتي
          const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&premium=true&country_code=sa`;
          const res = await fetch(url, { cache: 'no-store' });
          
          if (res.ok) {
            const html = await res.text();
            const $ = cheerio.load(html);
            const htmlLower = html.toLowerCase();
            
            // 1. فحص التوفر بدقة
            const metaAvailability = $('meta[property="product:availability"]').attr('content') || '';
            
            if (metaAvailability.includes('out of stock') || metaAvailability.includes('oos')) {
              microlessInStock = false;
            } else {
              const hasAddToCart = htmlLower.includes('add to cart') || htmlLower.includes('إضافة إلى العربة');
              if (!hasAddToCart && (htmlLower.includes('notify me') || htmlLower.includes('no longer available'))) {
                microlessInStock = false;
              } else {
                microlessInStock = true;
              }
            }

            // 2. فحص السعر بدقة
            let priceText = $('meta[property="product:price:amount"]').attr('content');
            if (!priceText) {
              priceText = $('.product-details .price, .product-info .amount, .product-price').first().text();
            }

            let cleanedPrice = parseFloat((priceText || '').replace(/,/g, '').replace(/[^0-9.]/g, ''));
            
            // تصحيح العملة لو تم تحويلها للدرهم بالخطأ
            if (htmlLower.includes('aed') && !htmlLower.includes('sar')) {
              cleanedPrice = cleanedPrice * 1.022;
            }

            if (!isNaN(cleanedPrice) && cleanedPrice > 0) {
              finalMicrolessPrice = parseFloat(cleanedPrice.toFixed(2));
            }
          }
        } catch (e) {
          // تجاهل
        }
      }

      // حساب السعر الأقل بناءً على توفر المخزون للمتاجر الثلاثة
      let validAmazonPrice = amazonInStock ? finalAmazonPrice : Infinity;
      let validCazasouqPrice = cazasouqInStock ? finalCazasouqPrice : Infinity;
      let validMicrolessPrice = microlessInStock ? finalMicrolessPrice : Infinity;
      
      let lowestPrice = Math.min(validAmazonPrice, validCazasouqPrice, validMicrolessPrice);
      const validLowestPrice = lowestPrice !== Infinity ? lowestPrice : comp.price;

      // 1. تنبيه نزول السعر (Deal Alert)
      let alertTag = "";
      if (validLowestPrice < comp.price && validLowestPrice !== Infinity) {
        alertTag = " 📉 **سعر لقطة!** <@&1510204041588900023>"; 
      }

      // 2. تنبيه إعادة التوفر في المخزون (Restock Alert)
      let restockTag = "";
      const amazonRestocked = (comp.amazonInStock === false && amazonInStock === true && finalAmazonPrice !== Infinity);
      const cazaRestocked = (comp.cazasouqInStock === false && cazasouqInStock === true && finalCazasouqPrice !== Infinity);
      const microRestocked = (comp.microlessInStock === false && microlessInStock === true && finalMicrolessPrice !== Infinity);

      if (amazonRestocked || cazaRestocked || microRestocked) {
        restockTag = " 📦 **توفرت من جديد!** <@&1510206266243416127>"; 
      }

      // تحديث قاعدة البيانات
      await prisma.component.update({
        where: { id: comp.id },
        data: {
          amazonPrice: finalAmazonPrice !== Infinity ? finalAmazonPrice : comp.amazonPrice,
          cazasouqPrice: finalCazasouqPrice !== Infinity ? finalCazasouqPrice : comp.cazasouqPrice,
          microlessPrice: finalMicrolessPrice !== Infinity ? finalMicrolessPrice : comp.microlessPrice,
          amazonInStock,
          cazasouqInStock,
          microlessInStock,
          price: validLowestPrice
        }
      });

      // تجهيز الروابط والأسعار للديسكورد (مع تقصير الروابط وتشفيرها)
      let stores: string[] = [];
      
      if (comp.amazonUrl) {
        let cleanAmzUrl = comp.amazonUrl.trim();
        if (cleanAmzUrl.includes('/ref=')) cleanAmzUrl = cleanAmzUrl.split('/ref=')[0];
        if (cleanAmzUrl.includes('?')) cleanAmzUrl = cleanAmzUrl.split('?')[0];
        cleanAmzUrl = encodeURI(decodeURI(cleanAmzUrl));

        if (amazonInStock && finalAmazonPrice !== Infinity) {
          stores.push(`[أمازون: ${finalAmazonPrice} ريال](${cleanAmzUrl})`);
        } else {
          stores.push(`[أمازون: غير متوفر ❌](${cleanAmzUrl})`);
        }
      }
      
      if (comp.cazasouqUrl) {
        let cleanCazaUrl = comp.cazasouqUrl.trim();
        if (cleanCazaUrl.includes('?')) cleanCazaUrl = cleanCazaUrl.split('?')[0];
        cleanCazaUrl = encodeURI(decodeURI(cleanCazaUrl));

        if (cazasouqInStock && finalCazasouqPrice !== Infinity) {
          stores.push(`[كازاسوق: ${finalCazasouqPrice} ريال](${cleanCazaUrl})`);
        } else {
          stores.push(`[كازاسوق: غير متوفر ❌](${cleanCazaUrl})`);
        }
      }

      if (comp.microlessUrl) {
        let cleanMicroUrl = comp.microlessUrl.trim();
        if (cleanMicroUrl.includes('?')) cleanMicroUrl = cleanMicroUrl.split('?')[0];
        cleanMicroUrl = encodeURI(decodeURI(cleanMicroUrl));

        if (microlessInStock && finalMicrolessPrice !== Infinity) {
          stores.push(`[مايكروليس: ${finalMicrolessPrice} ريال](${cleanMicroUrl})`);
        } else {
          stores.push(`[مايكروليس: غير متوفر ❌](${cleanMicroUrl})`);
        }
      }

      updatedCount++;
      // دمج التاغات مع اسم القطعة
      updatedItems.push({
        name: `${comp.name}${alertTag}${restockTag}`,
        storeLinks: stores
      });
    }
    
    const updatedNames = updatedItems.map(item => item.name);
    console.log(`[Cron Job] تم تحديث ${updatedCount} قطعة بنجاح:`, updatedNames.join(" ، "));

    // إرسال إشعار للديسكورد
    if (updatedCount > 0 && process.env.DISCORD_WEBHOOK_URL) {
      try {
        let descriptionText = `تم فحص وتحديث **${updatedCount}** قطعة.\n\n` + 
          updatedItems.map(item => {
            const linksText = item.storeLinks.length > 0 ? item.storeLinks.join(" | ") : "لا توجد روابط ⚠️";
            return `**${item.name}**\n↳ ${linksText}`;
          }).join("\n\n");

        // حماية إلزامية: قص النص إذا تجاوز حد ديسكورد (4096 حرف)
        if (descriptionText.length > 4000) {
          descriptionText = descriptionText.substring(0, 4000) + "\n\n**... (تم قص باقي الرسالة لتجاوز حد أحرف ديسكورد)**";
        }

        const discordPayload = {
          embeds: [
            {
              title: "✅ تم تحديث الأسعار والتوفر",
              description: descriptionText,
              color: 3066993,
              timestamp: new Date().toISOString()
            }
          ]
        };

        const discordRes = await fetch(process.env.DISCORD_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discordPayload)
        });

        if (!discordRes.ok) {
          const errText = await discordRes.text();
          console.error(`[Discord Error] Status: ${discordRes.status} - Details: ${errText}`);
        }
      } catch (error) {
        console.error("فشل إرسال إشعار الديسكورد:", error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `تم تحديث بيانات ${updatedCount} قطعة بنجاح.` ,
      updatedNames
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}