/**
 * ============ إيقاف سحب كازاسوق مؤقتاً — 2026-10-28 ============
 *
 * كازاسوق غيّر موقعه (2026-10-25 تقريباً) إلى واجهة جافاسكربت: الـHTML الخام صفحةٌ فارغة بلا سعرٍ
 * ولا توفّر، فقارئ lib/scrape-prices · scrapeCazasouq لا يجد صفّ التوفّر ولا زرّ السلّة فيحكم «نافد»،
 * والنافد بلا سعر ليس خطأً — فانقلبت عروضه الـ٢٥٤ كلّها نافدةً بلا خطأٍ واحد ولا تنبيه.
 *
 * `scrapeMode: 'off'` يُوقف الكرون عنه (lib/scrape-offers · skipped) ويُبقي عروضه منافسةً بسعرها
 * المحفوظ، ويُسقطها وحدها بعد ٣ أيّام بلا قراءة (lib/stores · MANUAL_STALE_DAYS) — شبكة الأمان
 * نفسها التي لنون. ويُعاد إلى 'native' حين يُكتب قارئٌ للموقع الجديد.
 *
 *   npx tsx scripts/pause-cazasouq-2026-10-28.ts --apply          # إيقاف
 *   npx tsx scripts/pause-cazasouq-2026-10-28.ts --apply --resume # إعادة
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';

(async () => {
  const resume = process.argv.includes('--resume');
  const s = await prisma.store.findFirst({ where: { slug: 'cazasouq' } });
  if (!s) throw new Error('لا متجر كازاسوق');
  const next = resume ? 'native' : 'off';
  console.log(`cazasouq scrapeMode: ${s.scrapeMode} → ${next}`);
  if (process.argv.includes('--apply') && s.scrapeMode !== next) {
    writeFileSync(`backups/cazasouq-store-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`, JSON.stringify(s, null, 2));
    await prisma.store.update({ where: { id: s.id }, data: { scrapeMode: next } });
    console.log('تمّ (النسخة في backups/)');
  }
  await prisma.$disconnect();
})();
