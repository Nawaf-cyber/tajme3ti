import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const components = await prisma.component.findMany({
      where: { amazonUrl: { not: null } }
    });

    let updatedCount = 0;
    const errors: string[] = [];
    const SCRAPER_API_KEY = "dbd6d15311b2604075c1aa72ae26849d"; 

    // تحديد عدد الطلبات المتزامنة (5 طلبات في نفس الوقت) لتسريع العملية وتجنب الحظر
    const chunkSize = 5; 
    
    for (let i = 0; i < components.length; i += chunkSize) {
      const chunk = components.slice(i, i + chunkSize);
      
      await Promise.all(chunk.map(async (comp) => {
        try {
          const targetUrl = encodeURIComponent(comp.amazonUrl!);
          const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&render=true`;

          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) throw new Error(`HTTP Status ${res.status}`);

          const html = await res.text();
          const $ = cheerio.load(html);

          let priceText = '';
          const mainPrice = $('.a-price .a-offscreen').first().text();
          
          if (mainPrice) {
            priceText = mainPrice;
          } else {
            const whole = $('.a-price-whole').first().text().replace(/[,.]/g, '');
            const fraction = $('.a-price-fraction').first().text();
            if (whole) priceText = fraction ? `${whole}.${fraction}` : whole;
          }

          const cleanedPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));

          if (!isNaN(cleanedPrice) && cleanedPrice > 0) {
            const currentCazaPrice = comp.cazasouqPrice || Infinity;
            const lowestPrice = Math.min(cleanedPrice, currentCazaPrice);

            await prisma.component.update({
              where: { id: comp.id },
              data: { 
                amazonPrice: cleanedPrice,
                price: lowestPrice !== Infinity ? lowestPrice : cleanedPrice 
              }
            });
            updatedCount++;
          } else {
            errors.push(`سعر غير صالح: ${comp.name}`);
          }
        } catch (err: any) {
          errors.push(`خطأ ${comp.name}: ${err.message}`);
        }
      }));
    }

    return NextResponse.json({ 
      success: true, 
      message: `تم تحديث أسعار ${updatedCount} منتج من أمازون بنجاح.`,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "حدث خطأ في النظام أثناء تحديث أمازون." }, { status: 500 });
  }
}