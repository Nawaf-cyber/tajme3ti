import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// دالة لحماية الاتصال من التعليق (Timeout بعد 10 ثوانٍ)
async function fetchWithTimeout(url: string, options: any = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function GET(req: Request) {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { id: "default" } });
    const isCronEnabled = setting ? setting.cronEnabled : false;

    if (!isCronEnabled) {
      return NextResponse.json({ message: "التحديث التلقائي معطل حالياً من لوحة التحكم." }, { status: 200 });
    }

    const SCRAPER_API_KEY = "f5b7de96f707ccf2b622fb377162dfb3"; 
    
    const searchConditions = { 
      OR: [
        { amazonUrl: { contains: "http" } },
        { cazasouqUrl: { contains: "http" } },
        { microlessUrl: { contains: "http" } }
      ]
    };

    const totalMatchingCount = await prisma.component.count({
      where: searchConditions
    });
    
    const components = await prisma.component.findMany({
      where: searchConditions,
      orderBy: { updatedAt: 'asc' }, 
      take: 10
    });

    let updatedCount = 0;
    let updatedItems: { name: string; storeLinks: string[] }[] = []; 
    let allErrors: string[] = [];

    const chunkSize = 5;
    for (let i = 0; i < components.length; i += chunkSize) {
      const chunk = components.slice(i, i + chunkSize);

      await Promise.all(chunk.map(async (comp) => {
        let finalAmazonPrice = comp.amazonPrice || Infinity;
        let finalCazasouqPrice = comp.cazasouqPrice || Infinity;
        let finalMicrolessPrice = comp.microlessPrice || Infinity;

        let amazonInStock = comp.amazonInStock ?? true;
        let cazasouqInStock = comp.cazasouqInStock ?? true;
        let microlessInStock = comp.microlessInStock ?? true;

        const hasValidAmz = comp.amazonUrl && comp.amazonUrl.length > 12;
        const hasValidCaza = comp.cazasouqUrl && comp.cazasouqUrl.length > 12;
        const hasValidMicro = comp.microlessUrl && comp.microlessUrl.length > 12;

        // تحديث أمازون
        if (hasValidAmz) {
          try {
            const targetUrl = encodeURIComponent(comp.amazonUrl!);
            const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&premium=true&country_code=sa`;
            // استخدام fetchWithTimeout بدلاً من fetch
            const res = await fetchWithTimeout(url, { cache: 'no-store' });
            
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
              } else {
                allErrors.push(`أمازون (${comp.name}): لم يتم العثور على سعر صالح.`);
              }
            } else {
              allErrors.push(`أمازون (${comp.name}): فشل الاتصال ${res.status}`);
            }
          } catch (e: any) {
            allErrors.push(`أمازون (${comp.name}): تجاوز الوقت المسموح (Timeout) أو خطأ اتصال.`);
          }
        }

        // تحديث كازاسوق
        if (hasValidCaza) {
          try {
            const targetUrl = encodeURIComponent(comp.cazasouqUrl!);
            const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}`;
            // استخدام fetchWithTimeout
            const res = await fetchWithTimeout(url, { cache: 'no-store' });
            
            if (res.ok) {
              const html = await res.text();
              const $ = cheerio.load(html);
              
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

              let priceText = '';
              let mainPriceEl = $('#content ul.list-unstyled h2, .product-info h2').first();
              
              if (mainPriceEl.length > 0) {
                 priceText = mainPriceEl.text();
              } else {
                 priceText = $('.price-new, .price, .product-price').not(':contains("170")').first().text();
              }

              let cleanedPrice = 0;
              const match = priceText.match(/\d+(?:,\d+)*(?:\.\d+)?/);
              if (match) {
                cleanedPrice = parseFloat(match[0].replace(/,/g, ''));
              }

              if (cleanedPrice === 170) {
                  let altText = $('h2').filter(function() { return $(this).text().match(/\d/) && !$(this).text().includes('170'); }).first().text();
                  const altMatch = altText.match(/\d+(?:,\d+)*(?:\.\d+)?/);
                  if (altMatch) cleanedPrice = parseFloat(altMatch[0].replace(/,/g, ''));
              }

              const isBHD = priceText.toLowerCase().includes('bhd') || priceText.includes('د.ب') || priceText.toLowerCase().includes('bd');
              
              if (isBHD) {
                cleanedPrice = cleanedPrice * 10;
              } else if (cleanedPrice > 0) {
                const amzPrice = finalAmazonPrice !== Infinity ? finalAmazonPrice : (comp.amazonPrice || 0);
                if (amzPrice > 0 && cleanedPrice < (amzPrice * 0.2)) {
                  cleanedPrice = cleanedPrice * 10;
                }
              }

              if (!isNaN(cleanedPrice) && cleanedPrice > 0 && cleanedPrice !== 170) {
                finalCazasouqPrice = cleanedPrice;
              } else {
                allErrors.push(`كازاسوق (${comp.name}): السعر المستخرج 170 أو غير صالح.`);
              }
            } else {
              allErrors.push(`كازاسوق (${comp.name}): فشل الاتصال ${res.status}`);
            }
          } catch (e: any) {
            allErrors.push(`كازاسوق (${comp.name}): تجاوز الوقت المسموح (Timeout) أو خطأ اتصال.`);
          }
        }

        // تحديث مايكروليس
        if (hasValidMicro) {
          try {
            const targetUrl = encodeURIComponent(comp.microlessUrl!);
            const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&premium=true&country_code=sa`;
            // استخدام fetchWithTimeout
            const res = await fetchWithTimeout(url, { cache: 'no-store' });
            
            if (res.ok) {
              const html = await res.text();
              const $ = cheerio.load(html);
              const htmlLower = html.toLowerCase();
              
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

              let priceText = $('meta[property="product:price:amount"]').attr('content');
              if (!priceText) {
                priceText = $('.product-details .price, .product-info .amount, .product-price').first().text();
              }

              let cleanedPrice = parseFloat((priceText || '').replace(/,/g, '').replace(/[^0-9.]/g, ''));
              
              if (htmlLower.includes('aed') && !htmlLower.includes('sar')) {
                cleanedPrice = cleanedPrice * 1.022;
              }

              if (!isNaN(cleanedPrice) && cleanedPrice > 0) {
                finalMicrolessPrice = parseFloat(cleanedPrice.toFixed(2));
              } else {
                allErrors.push(`مايكروليس (${comp.name}): لم يتم العثور على سعر صالح.`);
              }
            } else {
              allErrors.push(`مايكروليس (${comp.name}): فشل الاتصال ${res.status}`);
            }
          } catch (e: any) {
            allErrors.push(`مايكروليس (${comp.name}): تجاوز الوقت المسموح (Timeout) أو خطأ اتصال.`);
          }
        }

        let validAmazonPrice = amazonInStock ? finalAmazonPrice : Infinity;
        let validCazasouqPrice = cazasouqInStock ? finalCazasouqPrice : Infinity;
        let validMicrolessPrice = microlessInStock ? finalMicrolessPrice : Infinity;
        
        let lowestPrice = Math.min(validAmazonPrice, validCazasouqPrice, validMicrolessPrice);
        const validLowestPrice = lowestPrice !== Infinity ? lowestPrice : comp.price;

        let alertTag = "";
        if (validLowestPrice < comp.price && validLowestPrice !== Infinity) {
          alertTag = " 📉 **سعر لقطة!** <@&1510204041588900023>"; 
        }

        let restockTag = "";
        const amazonRestocked = (comp.amazonInStock === false && amazonInStock === true && finalAmazonPrice !== Infinity);
        const cazaRestocked = (comp.cazasouqInStock === false && cazasouqInStock === true && finalCazasouqPrice !== Infinity);
        const microRestocked = (comp.microlessInStock === false && microlessInStock === true && finalMicrolessPrice !== Infinity);

        if (amazonRestocked || cazaRestocked || microRestocked) {
          restockTag = " 📦 **توفرت من جديد!** <@&1510206266243416127>"; 
        }

        await prisma.component.update({
          where: { id: comp.id },
          data: {
            amazonPrice: finalAmazonPrice !== Infinity ? finalAmazonPrice : comp.amazonPrice,
            cazasouqPrice: finalCazasouqPrice !== Infinity ? finalCazasouqPrice : (comp.cazasouqPrice === 170 ? null : comp.cazasouqPrice),
            microlessPrice: finalMicrolessPrice !== Infinity ? finalMicrolessPrice : comp.microlessPrice,
            amazonInStock,
            cazasouqInStock,
            microlessInStock,
            price: validLowestPrice
          }
        });

        let stores: string[] = [];
        
        if (hasValidAmz) {
          let cleanAmzUrl = comp.amazonUrl!.trim();
          if (cleanAmzUrl.includes('/ref=')) cleanAmzUrl = cleanAmzUrl.split('/ref=')[0];
          if (cleanAmzUrl.includes('?')) cleanAmzUrl = cleanAmzUrl.split('?')[0];
          cleanAmzUrl = encodeURI(decodeURI(cleanAmzUrl));
          stores.push(amazonInStock && finalAmazonPrice !== Infinity ? `[أمازون: ${finalAmazonPrice} ريال](${cleanAmzUrl})` : `[أمازون: غير متوفر ❌](${cleanAmzUrl})`);
        }
        
        if (hasValidCaza) {
          let cleanCazaUrl = comp.cazasouqUrl!.trim();
          if (cleanCazaUrl.includes('?')) cleanCazaUrl = cleanCazaUrl.split('?')[0];
          cleanCazaUrl = encodeURI(decodeURI(cleanCazaUrl));
          stores.push(cazasouqInStock && finalCazasouqPrice !== Infinity ? `[كازاسوق: ${finalCazasouqPrice} ريال](${cleanCazaUrl})` : `[كازاسوق: غير متوفر ❌](${cleanCazaUrl})`);
        }

        if (hasValidMicro) {
          let cleanMicroUrl = comp.microlessUrl!.trim();
          if (cleanMicroUrl.includes('?')) cleanMicroUrl = cleanMicroUrl.split('?')[0];
          cleanMicroUrl = encodeURI(decodeURI(cleanMicroUrl));
          stores.push(microlessInStock && finalMicrolessPrice !== Infinity ? `[مايكروليس: ${finalMicrolessPrice} ريال](${cleanMicroUrl})` : `[مايكروليس: غير متوفر ❌](${cleanMicroUrl})`);
        }

        updatedCount++;
        updatedItems.push({
          name: `${comp.name}${alertTag}${restockTag}`,
          storeLinks: stores
        });

      }));
    }
    
    const updatedNames = updatedItems.map(item => item.name);

    if (updatedCount > 0 && process.env.DISCORD_WEBHOOK_URL) {
      try {
        let descriptionText = `تم فحص وتحديث **${updatedCount}** قطعة.\n\n` + 
          updatedItems.map(item => {
            const linksText = item.storeLinks.length > 0 ? item.storeLinks.join(" | ") : "لا توجد روابط ⚠️";
            return `**${item.name}**\n↳ ${linksText}`;
          }).join("\n\n");

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

        await fetch(process.env.DISCORD_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discordPayload)
        });
      } catch (error) {
        console.error("فشل إرسال إشعار الديسكورد:", error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `تم تحديث بيانات ${updatedCount} قطعة بنجاح.` ,
      updatedNames,
      totalMatchingCount,
      errors: allErrors.length > 0 ? allErrors : null
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}