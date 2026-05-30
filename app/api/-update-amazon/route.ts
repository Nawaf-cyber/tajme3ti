import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { id, amazonUrl, cazasouqPrice } = await req.json();
    
    if (!amazonUrl) return NextResponse.json({ error: "لا يوجد رابط" }, { status: 400 });

    const SCRAPER_API_KEY = "cbefd79855776832088f89e006209b25"; 
    const targetUrl = encodeURIComponent(amazonUrl);
    const url = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

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
      const currentCazaPrice = cazasouqPrice || Infinity;
      const lowestPrice = Math.min(cleanedPrice, currentCazaPrice);

      await prisma.component.update({
        where: { id },
        data: { 
          amazonPrice: cleanedPrice,
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