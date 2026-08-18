import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const P = s => typeof s === 'string' ? JSON.parse(s) : (s||{});
const has = (sp,k) => k in sp && String(sp[k]??'').trim() !== '';
const NEED = { CPU:['l3Cache','architecture'], GPU:['vram','memoryType','architecture'], Motherboard:['memorySpeed'], RAM:['kit'], PSU:['formFactor','modularity'], Case:['includedFans'] };
const rows = await prisma.component.findMany({ select:{id:true,brand:true,name:true,specs:true,category:{select:{name:true}}}, orderBy:{name:'asc'} });
for (const [cat,keys] of Object.entries(NEED)) {
  const list = rows.filter(r=>r.category.name===cat);
  for (const k of keys) {
    const miss = list.filter(r=>!has(P(r.specs),k));
    if(!miss.length) continue;
    console.log(`\n### ${cat} · ${k} — ${miss.length}`);
    for (const m of miss) console.log(`${m.id}|${m.brand}|${m.name}`);
  }
}
await prisma.$disconnect();
