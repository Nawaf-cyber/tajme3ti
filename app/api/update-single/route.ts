import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';
import { getToken } from 'next-auth/jwt';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// دالة انتظار بسيطة
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// جلب مع مهلة زمنية وإعادة محاولة عند 429 (طلبات كثيرة)
async function fetchSafe(url: string, options: any = {}, timeout = 25000) {
  const maxRetries = 3;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      if (response.status === 429 && attempt < maxRetries) {
        await sleep(2000 * (attempt + 1));
        continue;
      }
      return response;
    } catch (error) {
      clearTimeout(id);
      if (attempt < maxRetries) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
      throw error;
    }
  }
  throw new Error('فشلت كل محاولات الاتصال');
}

export async function POST(req: Request) {
  // حماية: أدمن فقط
  const token = await getToken({ req: req as any });
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "معرف القطعة مطلوب" }, { status: 400 });

    const comp = await prisma.component.findUnique({ where: { id } });
    if (!comp) return NextResponse.json({ error: "القطعة غير موجودة" }, { status: 404 });

    const SCRAPE_DO_TOKEN = process.env.SCRAPE_DO_TOKEN;
    if (!SCRAPE_DO_TOKEN) return NextResponse.json({ error: "SCRAPE_DO_TOKEN غير مضبوط في متغيرات البيئة" }, { status: 500 });

    let finalAmazonPrice = comp.amazonPrice || Infinity;
    let finalCazasouqPrice = comp.cazasouqPrice || Infinity;
    let finalMicrolessPrice = comp.microlessPrice || Infinity;
    
    let amazonInStock = true;
    let cazasouqInStock = true;
    let microlessInStock = true;
    
    let errors: string[] = [];

    // 1. الدخول وسحب سعر أمازون
    if (comp.amazonUrl) {
      try {
        const targetUrl = encodeURIComponent(comp.amazonUrl);
        // القديم (ScraperAPI):
        // const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&premium=true&country_code=sa`;
        const url = `https://api.scrape.do?token=${SCRAPE_DO_TOKEN}&url=${targetUrl}&geoCode=sa&render=true`;
        const res = await fetchSafe(url, { cache: 'no-store' });
        
        if (res.ok) {
          const html = await res.text();
          const $ = cheerio.load(html);
          
          const amzAvailability = $('#availability').text().toLowerCase();
          if (amzAvailability.includes('currently unavailable') || amzAvailability.includes('غير متوفر') || amzAvailability.includes('لا يتوفر')) {
            amazonInStock = false;
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
            errors.push('لم يتم العثور على سعر صالح في أمازون.');
          }
        } else {
          errors.push(`فشل اتصال سيرفر أمازون: ${res.status}`);
        }
      } catch (e: any) {
        errors.push(`خطأ في أمازون: ${e.message}`);
      }
    }

    // 2. تحديث كازاسوق (بالنظام الصارم الجديد - يدعم الإنجليزي والعربي)
    if (comp.cazasouqUrl) {
      try {
        const targetUrl = encodeURIComponent(comp.cazasouqUrl);
        // القديم (ScraperAPI):
        // const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&country_code=sa`;
        const url = `https://api.scrape.do?token=${SCRAPE_DO_TOKEN}&url=${targetUrl}&geoCode=sa`;
        const res = await fetchSafe(url, { cache: 'no-store' });
        
        if (res.ok) {
          const html = await res.text();
          const $ = cheerio.load(html);
          
          // تحويل النص للحروف الصغيرة ليسهل البحث بالإنجليزي، والعربي لن يتأثر
          const plainText = $('body').text().replace(/\s+/g, ' ').toLowerCase();

          // 1. فحص نفاد الكمية صراحة (عربي + إنجليزي)
          const isOutOfStockExplicit = plainText.includes('غير متوفر حالياً') || 
                                       plainText.includes('تنبيه بالتوافر') || 
                                       plainText.includes('نفدت الكمية') ||
                                       plainText.includes('out of stock') ||
                                       plainText.match(/التوفر:\s*0/) ||
                                       plainText.match(/availability:\s*0/);

          if (isOutOfStockExplicit) {
            cazasouqInStock = false;
          } else {
            // 2. فحص التوفر (عربي + إنجليزي)
            const hasStockNumberAr = plainText.match(/التوفر:\s*([1-9][0-9]*)/);
            const hasStockNumberEn = plainText.match(/availability:\s*([1-9][0-9]*)/);

            cazasouqInStock = !!hasStockNumberAr || !!hasStockNumberEn || 
                              plainText.includes('اضافة للسلة') || 
                              plainText.includes('إضافة للسلة') || 
                              plainText.includes('اشتر الان') ||
                              plainText.includes('اشتر الآن') ||
                              plainText.includes('add to cart') ||
                              plainText.includes('buy now') ||
                              plainText.includes('in stock');
          }

          // -- 2. فحص السعر --
          let priceText = '';
          let mainPriceEl = $('#content ul.list-unstyled h2, .product-info h2, .product-price').first();
          
          if (mainPriceEl.length > 0) {
             priceText = mainPriceEl.text();
          } else {
             priceText = $('.price-new, .price').not(':contains("170")').first().text();
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
            errors.push('لم يتم العثور على سعر صالح أو السعر المستخرج 170 في كازاسوق.');
          }
        } else {
          errors.push(`فشل اتصال سيرفر كازاسوق: ${res.status}`);
        }
      } catch (e: any) {
        errors.push(`خطأ في كازاسوق: ${e.message}`);
      }
    }

    // 3. الدخول وسحب سعر مايكروليس
    if (comp.microlessUrl) {
      try {
        const targetUrl = encodeURIComponent(comp.microlessUrl);
        // القديم (ScraperAPI):
        // const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&premium=true&country_code=sa`;
        const url = `https://api.scrape.do?token=${SCRAPE_DO_TOKEN}&url=${targetUrl}&geoCode=sa&render=true`;
        const res = await fetchSafe(url, { cache: 'no-store' });
        
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
            errors.push('لم يتم العثور على سعر صالح في مايكروليس.');
          }
        } else {
          errors.push(`فشل اتصال سيرفر مايكروليس: ${res.status}`);
        }
      } catch (e: any) {
        errors.push(`خطأ في مايكروليس: ${e.message}`);
      }
    }

    // 4. حساب السعر الأقل للمتاجر الثلاثة
    let validAmazonPrice = amazonInStock ? finalAmazonPrice : Infinity;
    let validCazasouqPrice = cazasouqInStock ? finalCazasouqPrice : Infinity;
    let validMicrolessPrice = microlessInStock ? finalMicrolessPrice : Infinity;
    
    let lowestPrice = Math.min(validAmazonPrice, validCazasouqPrice, validMicrolessPrice);
    const validLowestPrice = lowestPrice !== Infinity ? lowestPrice : comp.price;

    await prisma.component.update({
      where: { id },
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

    return NextResponse.json({ 
      success: true, 
      price: validLowestPrice,
      amazonInStock,
      cazasouqInStock,
      microlessInStock,
      errors: errors.length > 0 ? errors : undefined 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
