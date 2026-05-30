import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { id, cazasouqUrl, amazonPrice } = await req.json();
    
    if (!cazasouqUrl) return NextResponse.json({ error: "لا يوجد رابط" }, { status: 400 });

    const SCRAPER_API_KEY = "cbefd79855776832088f89e006209b25"; 
    const targetUrl = encodeURIComponent(cazasouqUrl);
    // تم إزالة render=true لتسريع الطلب وتجنب التايم أوت
    const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    const priceText = $('.price, .product-price, .price-item, .amount').first().text();
    let cleanedPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));

    const isBHD = priceText.toLowerCase().includes('bhd') || priceText.includes('د.ب') || priceText.toLowerCase().includes('bd');
    
    if (isBHD) {
      cleanedPrice = cleanedPrice * 10;
    } else if (cleanedPrice > 0) {
      const amzPrice = amazonPrice || 0;
      if (amzPrice > 0 && cleanedPrice < (amzPrice * 0.2)) {
        cleanedPrice = cleanedPrice * 10;
      }
    }

    if (!isNaN(cleanedPrice) && cleanedPrice > 0) {
      const currentAmazonPrice = amazonPrice || Infinity;
      const lowestPrice = Math.min(cleanedPrice, currentAmazonPrice);

      await prisma.component.update({
        where: { id },
        data: { 
          cazasouqPrice: cleanedPrice,
          price: lowestPrice !== Infinity ? lowestPrice : cleanedPrice 
        }
      });
      return NextResponse.json({ success: true, price: cleanedPrice });
    }

    return NextResponse.json({ error: "لم يتم العثور على السعر" }, { status: 404 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}