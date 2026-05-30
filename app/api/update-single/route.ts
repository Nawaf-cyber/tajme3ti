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
    
    let amazonInStock = true;
    let cazasouqInStock = true;
    
    let errors: string[] = [];

    // 1. الدخول وسحب سعر أمازون
    if (comp.amazonUrl) {
      try {
        const targetUrl = encodeURIComponent(comp.amazonUrl);
        const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}`;
        const res = await fetch(url, { cache: 'no-store' });
        
        if (res.ok) {
          const html = await res.text();
          const $ = cheerio.load(html);
          
          // فحص التوفر في أمازون
          const amzAvailability = $('#availability').text().toLowerCase();
          if (amzAvailability.includes('currently unavailable') || amzAvailability.includes('غير متوفر')) {
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
        const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}`;
        const res = await fetch(url, { cache: 'no-store' });
        
        if (res.ok) {
          const html = await res.text();
          const $ = cheerio.load(html);
          
          // فحص التوفر في كازاسوق (بحث عن كلمات نفاذ الكمية في زر الإضافة أو الصفحة)
          const buttonText = $('button[name="add"], .add-to-cart, .product-form__submit').text().toLowerCase();
          const outOfStockKeywords = ['نفدت', 'نفذت', 'sold out', 'out of stock', 'غير متوفر'];
          const isOutOfStock = outOfStockKeywords.some(keyword => buttonText.includes(keyword) || html.toLowerCase().includes(keyword));
          
          if (isOutOfStock) {
            cazasouqInStock = false;
          }

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

    // 3. حساب السعر الأقل
    // تجاهل سعر المتجر إذا كان غير متوفر أثناء حساب السعر الأقل
    let validAmazonPrice = amazonInStock ? finalAmazonPrice : Infinity;
    let validCazasouqPrice = cazasouqInStock ? finalCazasouqPrice : Infinity;
    
    let lowestPrice = Math.min(validAmazonPrice, validCazasouqPrice);
    
    // إذا كان كلاهما غير متوفر، نحتفظ بآخر سعر مسجل كمرجع
    const validLowestPrice = lowestPrice !== Infinity ? lowestPrice : comp.price;

    await prisma.component.update({
      where: { id },
      data: {
        amazonPrice: finalAmazonPrice !== Infinity ? finalAmazonPrice : comp.amazonPrice,
        cazasouqPrice: finalCazasouqPrice !== Infinity ? finalCazasouqPrice : comp.cazasouqPrice,
        amazonInStock,
        cazasouqInStock,
        price: validLowestPrice
      }
    });

    return NextResponse.json({ 
      success: true, 
      price: validLowestPrice,
      amazonInStock,
      cazasouqInStock,
      errors: errors.length > 0 ? errors : undefined 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}