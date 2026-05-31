import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "معرف القطعة مطلوب" }, { status: 400 });

    const comp = await prisma.component.findUnique({ where: { id } });
    if (!comp) return NextResponse.json({ error: "القطعة غير موجودة" }, { status: 404 });

    const SCRAPER_API_KEY = "cbefd79855776832088f89e006209b25";
    
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
        const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&premium=true&country_code=sa`;
        const res = await fetch(url, { cache: 'no-store' });
        
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

    // 2. الدخول وسحب سعر كازاسوق
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

          // -- 2. فحص السعر بدقة --
          let productContainer = $('#product, .product-info, .product-details').first();
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
            if (amzPriceForComparison > 0 && cleanedPrice < (amzPriceForComparison * 0.2)) {
              cleanedPrice = cleanedPrice * 10;
            }
          }

          // الحماية من رقم 170 مع تسجيل الأخطاء
          if (!isNaN(cleanedPrice) && cleanedPrice > 0 && cleanedPrice !== 170) {
            finalCazasouqPrice = parseFloat(cleanedPrice.toFixed(2));
          } else if (cleanedPrice === 170) {
             let alternativePriceText = $('h2').filter(function() { return $(this).text().includes('ر.س') && !$(this).text().includes('170'); }).first().text();
             let alternativeCleanedPrice = parseFloat(alternativePriceText.replace(/,/g, '').replace(/[^0-9.]/g, ''));
             if (!isNaN(alternativeCleanedPrice) && alternativeCleanedPrice > 0) {
                 finalCazasouqPrice = alternativeCleanedPrice;
             } else {
                 errors.push('لم يتم العثور على سعر صالح في كازاسوق (الرقم المستخرج 170).');
             }
          } else {
             errors.push('لم يتم العثور على سعر صالح في كازاسوق.');
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
        const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&premium=true&country_code=sa`;
        const res = await fetch(url, { cache: 'no-store' });
        
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