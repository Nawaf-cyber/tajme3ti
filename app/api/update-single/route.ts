import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // حماية المسار: لوحة الإدارة فقط (يُفحص الدور من قاعدة البيانات)
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const currentUser = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  if (currentUser?.role !== 'ADMIN') {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "معرف القطعة مطلوب" }, { status: 400 });

    const comp = await prisma.component.findUnique({ where: { id } });
    if (!comp) return NextResponse.json({ error: "القطعة غير موجودة" }, { status: 404 });

    // ملاحظة: الخدمة المستخدمة هي Scrape.do (token)، لا ScraperAPI.
    // اسم المتغيّر تاريخي — القيمة هي توكن Scrape.do من dashboard.scrape.do
    const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
    if (!SCRAPER_API_KEY) return NextResponse.json({ error: "SCRAPER_API_KEY غير مضبوط" }, { status: 500 });
    
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
        const url = `https://api.scrape.do/?token=${SCRAPER_API_KEY}&url=${targetUrl}&super=true`;
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

    // 2. تحديث كازاسوق
    if (comp.cazasouqUrl) {
      try {
        const targetUrl = encodeURIComponent(comp.cazasouqUrl);
        const url = `https://api.scrape.do/?token=${SCRAPER_API_KEY}&url=${targetUrl}`;
        const res = await fetch(url, { cache: 'no-store' });
        
        if (res.ok) {
          const html = await res.text();
          const $ = cheerio.load(html);
          
          // --- 1. فحص التوفر الدقيق القناص ---
          let hasAddToCart = false;
          const cartBtnText = $('#button-cart').text() || $('button').filter(function() { 
              const t = $(this).text().trim(); 
              return t === 'اضافة للسلة' || t === 'إضافة للسلة' || t === 'اشتر الآن' || t === 'اشتر الان'; 
          }).first().text();

          if (cartBtnText && cartBtnText.trim().length > 0) {
              hasAddToCart = true;
          }

          const hasNotifyBtn = $('button:contains("تنبيه بالتوافر")').length > 0 || $('.product-info, #content').first().text().includes('تنبيه بالتوافر');

          let availabilityText = '';
          $('.list-unstyled li, .product-info li, .product-details li').each((i, el) => {
              const txt = $(el).text();
              if (txt.includes('التوفر:') || txt.includes('Availability:')) {
                  availabilityText = txt;
              }
          });

          if (hasNotifyBtn || availabilityText.includes('غير متوفر') || availabilityText.includes('نفدت')) {
              cazasouqInStock = false;
          } else if (availabilityText.match(/[1-9]\d*/)) {
              // رقم موجب فقط — "التوفر: 0" لا يعني توفّراً
              cazasouqInStock = true;
          } else {
              cazasouqInStock = hasAddToCart;
          }

          // --- 2. استخراج السعر بطريقة محصنة ---
          let cleanedPrice = 0;
          $('.price-old, del, strike').remove(); 

          let mainPriceText = $('#content ul.list-unstyled h2, .product-info h2').first().text();
          if (!mainPriceText || mainPriceText.trim() === '') {
              mainPriceText = $('.price-new, .product-price, .price').first().text();
          }

          let match = mainPriceText.match(/\d+(?:,\d+)*(?:\.\d+)?/);
          if (match) {
              cleanedPrice = parseFloat(match[0].replace(/,/g, ''));
          }

          if (cleanedPrice === 170) {
              let altText = $('h2, .price-new, .product-price').not(':contains("170")').filter(function() { 
                  return !!$(this).text().match(/\d/); 
              }).first().text();
              
              let altMatch = altText.match(/\d+(?:,\d+)*(?:\.\d+)?/);
              if (altMatch) {
                  cleanedPrice = parseFloat(altMatch[0].replace(/,/g, ''));
              }
          }

          // --- 3. معالجة العملة ---
          const isBHD = html.toLowerCase().includes('bhd') || html.includes('د.ب') || html.includes('دينار بحريني');
          if (isBHD && cleanedPrice > 0) {
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
              errors.push(`لم يتم العثور على سعر صالح في كازاسوق.`);
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
        const url = `https://api.scrape.do/?token=${SCRAPER_API_KEY}&url=${targetUrl}&super=true`;
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