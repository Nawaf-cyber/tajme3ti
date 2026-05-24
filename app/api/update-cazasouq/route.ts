import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const components = await prisma.component.findMany({
      where: {
        cazasouqUrl: {
          not: null,
        }
      }
    });

    let updatedCount = 0;
    const errors: string[] = [];

    // مفتاح ScraperAPI الخاص بك
    const SCRAPER_API_KEY = "dbd6d15311b2604075c1aa72ae26849d"; 

    // تحديد عدد الطلبات المتزامنة لتسريع العملية (5 طلبات كحد أقصى في نفس الوقت لتجنب الحظر)
    const chunkSize = 5; 

    for (let i = 0; i < components.length; i += chunkSize) {
      const chunk = components.slice(i, i + chunkSize);
      
      await Promise.all(chunk.map(async (comp) => {
        if (!comp.cazasouqUrl) return;

        try {
          const targetUrl = encodeURIComponent(comp.cazasouqUrl);
          // إضافة render=true لتخطي حماية جافاسكربت المعقدة إن وجدت
          const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&render=true`;

          const res = await fetch(url, { cache: 'no-store' });

          if (!res.ok) throw new Error(`HTTP Status ${res.status}`);

          const html = await res.text();
          const $ = cheerio.load(html);

          const priceText = $('.price, .product-price, .price-item, .amount').first().text();
          let cleanedPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));

          // تصحيح عملة كازاسوق (تحويل الدينار إلى ريال)
          const isBHD = priceText.toLowerCase().includes('bhd') || priceText.includes('د.ب') || priceText.toLowerCase().includes('bd');

          if (isBHD) {
            cleanedPrice = cleanedPrice * 10;
          } else if (cleanedPrice > 0) {
            // تحقق احتياطي في حال عدم سحب رمز العملة: 
            // إذا كان السعر المسحوب أصغر من سعر أمازون بـ 80%، فهو بالدينار حتماً ويجب ضربه بـ 10
            const amzPrice = comp.amazonPrice || 0;
            if (amzPrice > 0 && cleanedPrice < (amzPrice * 0.2)) {
              cleanedPrice = cleanedPrice * 10;
            }
          }

          if (!isNaN(cleanedPrice) && cleanedPrice > 0) {
            const currentAmazonPrice = comp.amazonPrice || Infinity;
            const lowestPrice = Math.min(cleanedPrice, currentAmazonPrice);

            await prisma.component.update({
              where: { id: comp.id },
              data: { 
                cazasouqPrice: cleanedPrice,
                price: lowestPrice !== Infinity ? lowestPrice : cleanedPrice 
              }
            });
            updatedCount++;
          } else {
            errors.push(`لم يتم العثور على سعر صالح للقطعة: ${comp.name}`);
          }
        } catch (err: any) {
          errors.push(`خطأ في القطعة ${comp.name}: ${err.message}`);
        }
      }));
    }

    return NextResponse.json({ 
      success: true, 
      updatedCount, // تمت إضافة هذا السطر ليقرأه الزر
      message: `تم تحديث ${updatedCount} منتج بنجاح.`,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "حدث خطأ في النظام أثناء التحديث." }, { status: 500 });
  }
}