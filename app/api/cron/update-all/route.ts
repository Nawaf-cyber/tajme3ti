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
          { cazasouqUrl: { contains: "http" } }
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
      let amazonInStock = comp.amazonInStock ?? true;
      let cazasouqInStock = comp.cazasouqInStock ?? true;

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
      if (comp.cazasouqUrl) {
        try {
          const targetUrl = encodeURIComponent(comp.cazasouqUrl);
          const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}`;
          const res = await fetch(url, { cache: 'no-store' });
          
          if (res.ok) {
            const html = await res.text();
            const $ = cheerio.load(html);
            
            const buttonText = $('button[name="add"], .add-to-cart, .product-form__submit').text().toLowerCase();
            const outOfStockKeywords = ['نفدت', 'نفذت', 'sold out', 'out of stock', 'غير متوفر'];
            const isOutOfStock = outOfStockKeywords.some(keyword => buttonText.includes(keyword) || html.toLowerCase().includes(keyword));
            
            cazasouqInStock = !isOutOfStock;

            const priceText = $('.price, .product-price, .price-item, .amount').first().text();
            let cleanedPrice = parseFloat(priceText.replace(/,/g, '').replace(/[^0-9.]/g, ''));

            const isBHD = priceText.toLowerCase().includes('bhd') || priceText.includes('د.ب') || priceText.toLowerCase().includes('bd');
            if (isBHD) {
              cleanedPrice = cleanedPrice * 10;
            } else if (cleanedPrice > 0) {
              const amzPriceForComparison = finalAmazonPrice !== Infinity ? finalAmazonPrice : (comp.amazonPrice || 0);
              if (amzPriceForComparison > 0 && cleanedPrice < (amzPriceForComparison * 0.2)) {
                cleanedPrice = cleanedPrice * 10;
              }
            }

            if (!isNaN(cleanedPrice) && cleanedPrice > 0) {
              finalCazasouqPrice = cleanedPrice;
            }
          }
        } catch (e) {
          // تجاهل
        }
      }

      // حساب السعر الأقل بناءً على توفر المخزون
      let validAmazonPrice = amazonInStock ? finalAmazonPrice : Infinity;
      let validCazasouqPrice = cazasouqInStock ? finalCazasouqPrice : Infinity;
      let lowestPrice = Math.min(validAmazonPrice, validCazasouqPrice);
      const validLowestPrice = lowestPrice !== Infinity ? lowestPrice : comp.price;

      // التحقق إذا السعر الجديد أقل من السعر القديم
      let alertTag = "";
      if (validLowestPrice < comp.price && validLowestPrice !== Infinity) {
        alertTag = " 📉 **سعر لقطة!** <@&رقم_الرتبة>"; // استبدل رقم_الرتبة بـ ID الرتبة في ديسكورد
      }

      // تحديث قاعدة البيانات
      await prisma.component.update({
        where: { id: comp.id },
        data: {
          amazonPrice: finalAmazonPrice !== Infinity ? finalAmazonPrice : comp.amazonPrice,
          cazasouqPrice: finalCazasouqPrice !== Infinity ? finalCazasouqPrice : comp.cazasouqPrice,
          amazonInStock,
          cazasouqInStock,
          price: validLowestPrice
        }
      });

      // تجهيز الروابط والأسعار للديسكورد (مع تقصير الروابط وتشفيرها)
      let stores: string[] = [];
      
      if (comp.amazonUrl) {
        // تنظيف رابط أمازون من التتبع وحل مشكلة الحروف العربية
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
        // تنظيف رابط كازاسوق وتشفيره
        let cleanCazaUrl = comp.cazasouqUrl.trim();
        if (cleanCazaUrl.includes('?')) cleanCazaUrl = cleanCazaUrl.split('?')[0];
        cleanCazaUrl = encodeURI(decodeURI(cleanCazaUrl));

        if (cazasouqInStock && finalCazasouqPrice !== Infinity) {
          stores.push(`[كازاسوق: ${finalCazasouqPrice} ريال](${cleanCazaUrl})`);
        } else {
          stores.push(`[كازاسوق: غير متوفر ❌](${cleanCazaUrl})`);
        }
      }

      updatedCount++;
      updatedItems.push({
        name: `${comp.name}${alertTag}`,
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