import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const components = await prisma.component.findMany({
      select: { 
        id: true, 
        name: true, 
        amazonUrl: true, 
        cazasouqUrl: true, 
        amazonPrice: true, 
        cazasouqPrice: true 
      }
    });
    return NextResponse.json({ components });
  } catch (error) {
    return NextResponse.json({ error: "فشل جلب القطع" }, { status: 500 });
  }
}