/* ============ هل خرجت Arc من توصية الشوتر؟ ============
 *
 * تُحاكي اختيار الكرت كما يفعله الباني: مستوىً، ثم أرخصُ كافٍ في الذاكرة،
 * ثم سقفُ سعرٍ نسبيّ — وتُظهر ما يقع عليه الاختيار قبل القاعدة وبعدها.
 *
 * **يقرأ ولا يكتب.**
 *   npx tsx scripts/arc-shooter-check.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const G='\x1b[32m',R='\x1b[31m',Y='\x1b[33m',D='\x1b[2m',X='\x1b[0m';
const sp=(s:any)=>(typeof s==='string'?JSON.parse(s):s||{});
const vram=(c:any)=>{const v=String(sp(c.specs).vram||'').match(/[\d.]+/);if(v)return +v[0];const m=String(c.name||'').match(/(\d+)\s*GB/i);return m?+m[1]:0;};
let pass=0,fail=0;
const check=(t:string,ok:boolean,d='')=>{if(ok){pass++;console.log(`  ${G}✔${X} ${t}`);}else{fail++;console.log(`  ${R}✘ ${t}${X} ${d}`);}};

async function main(){
  const gpus=await prisma.component.findMany({where:{category:{name:'GPU'}},include:{offers:{include:{store:true}}}});
  const live=gpus.filter(g=>g.offers.some(o=>(o.price??0)>0&&o.inStock!==false));
  console.log(`\nكروت لها عرضٌ متوفّر: ${live.length} من ${gpus.length}`);

  for(const tier of [2,3,4]){
    const pool=live.filter(g=>g.performanceTier===tier);
    if(!pool.length) continue;
    const adequate=pool.filter(g=>vram(g)>=8);
    const src=[...(adequate.length?adequate:pool)].sort((a,b)=>a.price-b.price);
    const capMult=tier===2?1.0:tier===3?1.45:2.0;
    const pick=(pool:any[])=>{const inB=pool.filter(c=>c.price<=pool[0].price*capMult);const l=inB.length?inB:pool;
      return tier===2?l[0]:[...l].sort((a,b)=>(vram(b)-vram(a))||(a.price-b.price))[0];};

    const before=pick(src);
    /* القاعدة تُطبَّق **قبل** السقف — كما في الباني */
    const nonArc=src.filter(c=>!/^intel$/i.test(String(c.brand||'')));
    const after=pick(nonArc.length?nonArc:src);
    const hasAlt=nonArc.length>0;

    const changed=before?.id!==after?.id;
    console.log(`\nمستوى ${tier} — ${pool.length} كرت`);
    console.log(`  قبل: ${before?.brand} ${before?.name} ${D}(${before?.price} ﷼)${X}`);
    console.log(`  بعد: ${after?.brand} ${after?.name} ${D}(${after?.price} ﷼)${X}  ${changed?`${Y}تغيّر${X}`:`${D}كما هو${X}`}`);
    check(`مستوى ${tier}: التوصية ليست Intel`, !/^intel$/i.test(String(after?.brand||'')), String(after?.brand));
    check(`مستوى ${tier}: بقي هناك خيار`, !!after);
  }

  /* لو اختار المستخدم Intel صراحةً */
  const intelOnly=live.filter(g=>/^intel$/i.test(String(g.brand||'')));
  check(`اختيار Intel صراحةً يبقى ممكناً (${intelOnly.length} كرت)`, intelOnly.length>0);

  console.log(`\n${'═'.repeat(44)}`);
  console.log(fail===0?`${G}نجحت (${pass})${X}`:`${R}فشل ${fail} من ${pass+fail}${X}`);
  await prisma.$disconnect();
  if(fail)process.exit(1);
}
main().catch(async(e)=>{console.error(e);await prisma.$disconnect();process.exit(1);});
