import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. جلب القطع التي تحتوي على رابط أمازون
    const components = await prisma.component.findMany({
      where: {
        amazonUrl: {
          not: null
        }
      }
    });

    let updatedCount = 0;
    const errors: string[] = [];
    const SCRAPER_API_KEY = "dbd6d15311b2604075c1aa72ae26849d"; 

    for (const comp of components) {
      if (!comp.amazonUrl) continue;

      try {
        // 2. إرسال الطلب عبر ScraperAPI لتخطي حماية أمازون
        const targetUrl = encodeURIComponent(comp.amazonUrl);
        const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&render=true`;

        const res = await fetch(url, { cache: 'no-store' });

        if (!res.ok) throw new Error(`HTTP Status ${res.status}`);

        const html = await res.text();
        const $ = cheerio.load(html);

        // 3. استخراج السعر باستخدام كلاسات أمازون القياسية
        let priceText = '';
        
        // المحاولة الأولى: قراءة النص المخفي الشامل للسعر
        const mainPrice = $('.a-price .a-offscreen').first().text();
        if (mainPrice) {
          priceText = mainPrice;
        } else {
          // المحاولة الثانية: دمج الأرقام الصحيحة مع الكسور في حال تفرقت الكلاسات
          const whole = $('.a-price-whole').first().text().replace(/[,.]/g, '');
          const fraction = $('.a-price-fraction').first().text();
          if (whole) {
            priceText = fraction ? `${whole}.${fraction}` : whole;
          }
        }

        // تنظيف النص للحصول على الرقم العشري فقط
        const cleanedPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));

        if (!isNaN(cleanedPrice) && cleanedPrice > 0) {
          // 4. مقارنة سعر أمازون الجديد مع سعر كازاسوق الحالي لتحديد الأرخص
          const currentCazaPrice = comp.cazasouqPrice || Infinity;
          const lowestPrice = Math.min(cleanedPrice, currentCazaPrice);

          // تحديث الحقول في قاعدة البيانات
          await prisma.component.update({
            where: { id: comp.id },
            data: { 
              amazonPrice: cleanedPrice,
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
    }

    return NextResponse.json({ 
      success: true, 
      updatedCount, // تمت إضافة هذا السطر ليقرأه الزر
      message: `تم تحديث أسعار ${updatedCount} منتج من أمازون بنجاح.`,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "حدث خطأ في النظام أثناء تحديث أمازون." }, { status: 500 });
  }
}