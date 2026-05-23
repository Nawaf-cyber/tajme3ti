import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const components = await prisma.component.findMany({
      orderBy: { createdAt: 'asc' } 
    });

    const seen = new Set();
    const duplicatesIds: string[] = [];

    for (const comp of components) {
      const uniqueIdentifier = `${comp.brand}-${comp.name}`.toLowerCase().trim();

      if (seen.has(uniqueIdentifier)) {
        duplicatesIds.push(comp.id);
      } else {
        seen.add(uniqueIdentifier);
      }
    }

    if (duplicatesIds.length > 0) {
      await prisma.component.deleteMany({
        where: {
          id: { in: duplicatesIds }
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `تم مسح ${duplicatesIds.length} قطعة مكررة.`,
      deletedCount: duplicatesIds.length 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشلت عملية مسح المكررات." }, { status: 500 });
  }
}