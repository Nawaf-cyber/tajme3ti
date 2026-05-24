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

    for (const comp of components) {
      if (!comp.cazasouqUrl) continue;

      try {
        const targetUrl = encodeURIComponent(comp.cazasouqUrl);
        // إضافة render=true لتخطي حماية جافاسكربت المعقدة إن وجدت
        const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&render=true`;

        const res = await fetch(url, { cache: 'no-store' });

        if (!res.ok) throw new Error(`HTTP Status ${res.status}`);

        const html = await res.text();
        const $ = cheerio.load(html);

        const priceText = $('.price, .product-price, .price-item, .amount').first().text();
        const cleanedPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));

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
    }

    return NextResponse.json({ 
      success: true, 
      message: `تم تحديث ${updatedCount} منتج بنجاح.`,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "حدث خطأ في النظام أثناء التحديث." }, { status: 500 });
  }
}