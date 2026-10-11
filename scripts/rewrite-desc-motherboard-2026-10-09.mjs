/**
 * ============ إعادة كتابة أوصاف اللوحات الأمّ القصيرة — 2026-10-09 ============
 *
 * ثماني عشرة لوحة دون 900 حرف. الأرقام من مواصفات القطعة المسجّلة (الفتحات، منافذ M.2، الشبكة،
 * سرعة الذاكرة، حدّ المعالج) ومن الوصف السابق نفسه — لا رقم جديد.
 * PRO A620M-E: كان «البديل» معالجاً لا لوحة وبصيغةٍ مكسورة (بلا نجمة) — صار B650M DS3H.
 *
 *   node scripts/rewrite-desc-motherboard-2026-10-09.mjs           # عرض
 *   node scripts/rewrite-desc-motherboard-2026-10-09.mjs --apply   # تنفيذ (نسخة احتياطية أوّلاً)
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const TAG = 'motherboard';

const alt = (name, id, ...why) => `---\nبإمكانك التوجه إلى [${name}](/components/${id}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const REWRITE = [
  {
    id: 'cmv18kucj002tjgym8l4pmv4o',
    description: `### Gigabyte B760M D3HP WIFI6

لوحة B760 بحجم Micro-ATX لمعالجات Intel من الجيل الثاني عشر إلى الرابع عشر: أربع فتحات DDR5، ومنفذا M.2 بالجيل الرابع، وواي‑فاي 6. أساسٌ متكامل لتجميعة ألعابٍ متوسّطة بمعالج i5 أو i7.

**التقنيات الأساسية المدعومة:**

[green]أربع فتحات DDR5 حتى 192 جيجابايت:[/green] تبدأ بشريحتين وتضيف اثنتين لاحقاً، أو تركّب سعةً كبيرة للعمل.

[green]منفذا M.2 بالجيل الرابع x4:[/green] قرصان سريعان بكامل سرعتهما، للنظام وللألعاب.

[green]واي‑فاي 6 وشبكة 2.5 جيجابت:[/green] اتّصالٌ لاسلكيّ مدمج دون بطاقةٍ إضافيّة، وشبكة سلكيّة أسرع من 1 جيجابت المعتادة.

[green]كسر سرعة الذاكرة (XMP):[/green] شيبست B760 يسمح بتشغيل الذاكرة بسرعتها الكاملة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحة الكرت بالجيل الرابع. لا فرق يُذكر مع كروت اليوم، لكنّها دون لوحات B760 بفتحة الجيل الخامس.
* منصّة LGA1700 منتهية، فلا معالجات أحدث عليها بعد الجيل الرابع عشر.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا كسر سرعة للمعالج، فشيبست B760 لا يسمح بذلك حتى لمعالجات K.

---
بإمكانك التوجه إلى [ASRock B760M Pro RS](/components/cmpieb67b000m00ymc9cu16eo) إذا كان توجهك يتركز على الآتي:
* لوحة B760 أخرى بثلاثة منافذ M.2.
https://www.gigabyte.com/Motherboard/B760M-D3HP-WIFI6/sp`,
  },
  {
    id: 'cmv18kvma002zjgym6od60fk4',
    description: `### Gigabyte B760M DS3H WIFI6E GEN5

إصدار GEN5 من B760M DS3H: فتحة كرت بالجيل الخامس، وواي‑فاي 6E، وأربع فتحات DDR5. لوحةٌ لمعالجات Intel من الجيل الثاني عشر إلى الرابع عشر بمزايا أحدث من فئتها.

**التقنيات الأساسية المدعومة:**

[green]فتحة كرت PCIe 5.0:[/green] جاهزةٌ لكروت الجيل القادم، ونادرةٌ في لوحات B760 بهذا السعر.

[green]واي‑فاي 6E وبلوتوث 5.3:[/green] نطاق 6 جيجاهرتز أقلّ ازدحاماً من 5 جيجاهرتز في المباني المكتظّة.

[green]أربع فتحات DDR5 حتى 256 جيجابايت:[/green] مساحةٌ واسعة للترقية.

[green]شبكة 2.5 جيجابت:[/green] لمن يتّصل بكابل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذا M.2 فقط.
* منصّة LGA1700 منتهية.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا كسر سرعة للمعالج (B760).

---
بإمكانك التوجه إلى [ASRock B760M Pro RS](/components/cmpieb67b000m00ymc9cu16eo) إذا كان توجهك يتركز على الآتي:
* لوحة B760 بثلاثة منافذ M.2 وسعرٍ أقلّ.
https://www.gigabyte.com/Motherboard/B760M-DS3H-WIFI6E-GEN5/sp`,
  },
  {
    id: 'cmv18ktjj002kjgymotnjdmk9',
    description: `### Gigabyte B840M EAGLE WIFI6

لوحة B840 بواي‑فاي 6 وشبكة 2.5 جيجابت: اتّصالٌ لاسلكيّ في لوحةٍ اقتصاديّة لمنصّة AM5. تناسب تجميعة Ryzen متوسّطة بمعالج 65 واط مثل 7600 أو 9600.

**التقنيات الأساسية المدعومة:**

[green]مقبس AM5:[/green] يدعم Ryzen 7000 و8000 و9000، مع ترقيةٍ مفتوحة لأجيالٍ قادمة على اللوحة نفسها.

[green]واي‑فاي 6 وبلوتوث 5.3:[/green] بلا بطاقةٍ إضافيّة.

[green]شبكة 2.5 جيجابت.[/green]

[green]منفذا M.2 بآليّة EZ-Latch:[/green] تركيب الأقراص بلا براغٍ.

[green]ذاكرة DDR5 حتى 7600 كسر سرعة:[/green] أطقم 6000 تعمل بملفّ EXPO بلا مشكلة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2 الثاني بالجيل الثالث x2 فقط، فسرعته نحو ربع الأوّل.
* منفذا ذاكرة فقط (حتى 128 جيجابايت).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا PCIe 5.0 للكرت ولا للأقراص، ولا كسر سرعة للمعالج (B840).

---
بإمكانك التوجه إلى [MSI PRO B840M-P WiFi6E](/components/cmuzv43g0000zpcym7h9wju94) إذا كان توجهك يتركز على الآتي:
* لوحة B840 بواي‑فاي 6E وأربع فتحات ذاكرة.
https://www.gigabyte.com/Motherboard/B840M-EAGLE-WIFI6-rev-10-11/sp`,
  },
  {
    id: 'cmv18kv3e002wjgymr0juexn6',
    description: `### ASUS PRIME B760M-A WIFI II

الإصدار الثاني من PRIME B760M-A WIFI: فتحة كرت بالجيل الخامس، وأربع فتحات DDR5، وواي‑فاي. لوحةٌ متوازنة لمعالجات Intel من الجيل الثاني عشر إلى الرابع عشر.

**التقنيات الأساسية المدعومة:**

[green]فتحة كرت PCIe 5.0 بتصميم SafeSlot:[/green] فتحةٌ مدعّمة بالمعدن تتحمّل وزن الكروت الثقيلة.

[green]أربع فتحات DDR5 حتى 256 جيجابايت:[/green] مساحةٌ واسعة للترقية.

[green]واي‑فاي 6 وشبكة 2.5 جيجابت:[/green] اتّصالٌ كامل بلا بطاقات إضافيّة.

[green]كسر سرعة الذاكرة (XMP):[/green] الذاكرة تعمل بسرعتها الكاملة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذا M.2 فقط.
* منصّة LGA1700 منتهية.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا كسر سرعة للمعالج (B760).

---
بإمكانك التوجه إلى [MSI PRO B760M-A WiFi](/components/cmpieb6o7000o00ymqej7bko3) إذا كان توجهك يتركز على الآتي:
* لوحة B760 من MSI بمواصفاتٍ قريبة.
https://www.asus.com/motherboards-components/motherboards/prime/prime-b760m-a-wifi-ii/`,
  },
  {
    id: 'cmv18kt1n002ejgymyl44q6k9',
    description: `### MSI PRO B840M-B

لوحة B840 اقتصاديّة من MSI: منفذا M.2 بالجيل الرابع وشبكة 2.5 جيجابت، بسعرٍ قريب من لوحات A620. تناسب تجميعة Ryzen اقتصاديّة متّصلة بكابل.

**التقنيات الأساسية المدعومة:**

[green]منفذا M.2 بالجيل الرابع x4:[/green] قرصان سريعان بكامل سرعتهما، وهو أفضل من لوحات A620 بمنفذٍ واحد.

[green]شبكة Realtek بسرعة 2.5 جيجابت.[/green]

[green]ذاكرة DDR5 حتى 8000 كسر سرعة:[/green] أطقم 6000 تعمل بملفّ EXPO.

[green]مقبس AM5:[/green] ترقية المعالج لاحقاً على اللوحة نفسها.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذا ذاكرة فقط (128 جيجابايت كحدٍّ أقصى).
* فتحة الكرت بالجيل الرابع.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا واي‑فاي مدمج، ولا كسر سرعة للمعالج.

---
بإمكانك التوجه إلى [MSI PRO B840M-P WiFi6E](/components/cmuzv43g0000zpcym7h9wju94) إذا كان توجهك يتركز على الآتي:
* لوحة B840 من MSI بواي‑فاي 6E وأربع فتحات ذاكرة.
https://www.msi.com/Motherboard/PRO-B840M-B`,
  },
  {
    id: 'cmv18ktao002hjgymbo33akaw',
    description: `### ASUS PRIME B840M-K

لوحة ASUS الاقتصاديّة على شيبست B840: منفذا M.2، وشبكة 2.5 جيجابت، ومنفذ Type-C أماميّ. تناسب تجميعة Ryzen اقتصاديّة متّصلة بكابل.

**التقنيات الأساسية المدعومة:**

[green]منفذا M.2 بالجيل الرابع:[/green] قرصان سريعان.

[green]شبكة Realtek بسرعة 2.5 جيجابت.[/green]

[green]منفذ USB Type-C للواجهة الأماميّة:[/green] يستفيد من منفذ Type-C في الكيسات الحديثة.

[green]إضاءة Aura Sync:[/green] تتحكّم بإضاءة القطع من برنامج ASUS.

[green]مقبس AM5:[/green] يدعم Ryzen 7000 و8000 و9000.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذا ذاكرة فقط.
* فتحة الكرت بالجيل الرابع.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا واي‑فاي مدمج، ولا كسر سرعة للمعالج.

---
بإمكانك التوجه إلى [Gigabyte B850M DS3H](/components/cmuzkkfen0006u4ympd4lej5s) إذا كان توجهك يتركز على الآتي:
* لوحة B850 بأربع فتحات ذاكرة وفتحة كرت بالجيل الخامس.
https://www.asus.com/motherboards-components/motherboards/prime/prime-b840m-k/`,
  },
  {
    id: 'cmv18kvxr0032jgym2nkr43pt',
    description: `### MSI MPG B760I EDGE WIFI

لوحة Mini-ITX من سلسلة MPG EDGE لتجميعات Intel الصغيرة: فتحة كرت بالجيل الخامس، وواي‑فاي 6E، وشبكة 2.5 جيجابت. لمن يبني جهازاً قويّاً في كيسٍ صغير.

**التقنيات الأساسية المدعومة:**

[green]حجم Mini-ITX (17 × 17 سم):[/green] للكيسات الصغيرة التي تجلس على المكتب.

[green]فتحة كرت PCIe 5.0:[/green] كرتٌ كامل الحجم بأعلى سرعة.

[green]منفذا M.2:[/green] رغم صغر اللوحة.

[green]واي‑فاي 6E وشبكة 2.5 جيجابت:[/green] اتّصالٌ كامل، وهو أهمّ في اللوحات الصغيرة التي لا تتّسع لبطاقاتٍ إضافيّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذا ذاكرة فقط، وفتحة توسعةٍ واحدة.
* أغلى من لوحات Micro-ATX بالشيبست نفسه.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا كسر سرعة للمعالج (B760)، والمنصّة منتهية.

---
بإمكانك التوجه إلى [MSI MPG B850I EDGE TI WIFI](/components/cmtjkeozr000eygymbt7vxqqy) إذا كان توجهك يتركز على الآتي:
* لوحة EDGE Mini-ITX لمنصّة AMD الحديثة.
https://www.msi.com/Motherboard/MPG-B760I-EDGE-WIFI`,
  },
  {
    id: 'cmv18ku20002qjgym78vevtlj',
    description: `### Gigabyte H610M D3W WIFI6

لوحة H610 بذاكرة DDR5 وواي‑فاي 6، لمعالجات Intel من الجيل الثاني عشر إلى الرابع عشر بأقلّ كلفة. تناسب جهازاً مكتبيّاً أو تجميعة ألعابٍ اقتصاديّة بمعالج i3 أو i5.

**التقنيات الأساسية المدعومة:**

[green]واي‑فاي 6 وبلوتوث 5.3 مدمجان:[/green] ميزةٌ نادرة في لوحات H610.

[green]ذاكرة DDR5:[/green] لا تحتاج شراء ذاكرة DDR4 القديمة.

[green]فتحة الكرت بالجيل الرابع:[/green] تكفي أيّ كرتٍ حاليّ.

[green]مقاس Micro-ATX:[/green] يركب في أغلب الكيسات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2 واحد بالجيل الثالث، ومنفذا ذاكرة فقط.
* مراحل طاقة بسيطة، فالأنسب لها معالجات i3 وi5 غير K.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا كسر سرعة، وشبكة 1 جيجابت فقط.

---
بإمكانك التوجه إلى [ASUS PRIME H610M-K D4](/components/cmsrkfbz00002rcym23d53vn8) إذا كان توجهك يتركز على الآتي:
* لوحة H610 أرخص بذاكرة DDR4 وبلا واي‑فاي.
https://www.gigabyte.com/Motherboard/H610M-D3W-WIFI6-rev-11/sp`,
  },
  {
    id: 'cmv18kw930035jgymyheu82ja',
    description: `### Gigabyte H810M GAMING WIFI6

لوحة H810 اقتصاديّة لمعالجات Intel Core Ultra (السلسلة 2) على مقبس LGA1851، بواي‑فاي 6 وشبكة 2.5 جيجابت. تناسب تجميعة Intel حديثة بميزانيّةٍ محدودة.

**التقنيات الأساسية المدعومة:**

[green]مقبس LGA1851:[/green] للمعالجات الأحدث من Intel (Core Ultra 5 و7 و9).

[green]واي‑فاي 6 وبلوتوث 5.3.[/green]

[green]شبكة Realtek بسرعة 2.5 جيجابت.[/green]

[green]منفذ M.2 بالجيل الرابع مع مشتّت:[/green] القرص الرئيسيّ لا يُخنق بالحرارة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2 واحد ومنفذا ذاكرة فقط.
* مراحل طاقة بسيطة، فالأنسب لها معالجات Core Ultra 5 غير K.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا كسر سرعة، وفتحة الكرت بالجيل الرابع.

---
بإمكانك التوجه إلى [Gigabyte H810M H](/components/cmsqke9vu0000h0ymg80t79nw) إذا كان توجهك يتركز على الآتي:
* لوحة H810 أرخص بلا واي‑فاي.
https://www.gigabyte.com/Motherboard/H810M-GAMING-WIFI6/sp`,
  },
  {
    id: 'cmv18ktss002njgym6dh7by9z',
    description: `### ASUS PRIME B840-PLUS WIFI

لوحة B840 بحجم ATX كامل: أربع فتحات ذاكرة، وثلاثة منافذ M.2، وواي‑فاي 6E. تناسب تجميعة Ryzen تحتاج أقراصاً كثيرة وسعة ذاكرة كبيرة بسعرٍ أقلّ من B850.

**التقنيات الأساسية المدعومة:**

[green]حجم ATX بأربع فتحات ذاكرة حتى 192 جيجابايت:[/green] مساحةٌ للترقية وفتحات توسعةٍ أكثر من Micro-ATX.

[green]ثلاثة منافذ M.2:[/green] للنظام والألعاب والملفّات.

[green]واي‑فاي 6E وشبكة 2.5 جيجابت.[/green]

[green]فتحة كرت بتصميم SafeSlot:[/green] مدعّمة لتتحمّل الكروت الثقيلة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* شيبست B840 بخطوطٍ أقلّ من B850، فتحة الكرت بالجيل الرابع وبعض منافذ M.2 أبطأ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا PCIe 5.0 للكرت ولا للأقراص، ولا كسر سرعة للمعالج.

---
بإمكانك التوجه إلى [Gigabyte B850 GAMING X WiFi6E](/components/cmuzkkfpp000au4ymb7a4v538) إذا كان توجهك يتركز على الآتي:
* لوحة B850 بحجم ATX وفتحة كرت بالجيل الخامس.
https://www.asus.com/motherboards-components/motherboards/prime/prime-b840-plus-wifi/`,
  },
  {
    id: 'cmv18ksse002bjgymq88fzexz',
    description: `### Gigabyte A620M H

من أرخص لوحات AM5 في الكتالوج: مدخلٌ إلى منصّة Ryzen الحديثة بأقلّ كلفة. تناسب جهازاً مكتبيّاً أو تجميعة ألعابٍ اقتصاديّة بمعالج 65 واط.

**التقنيات الأساسية المدعومة:**

[green]مقبس AM5:[/green] يدعم Ryzen 7000 و8000 و9000، والترقية لاحقاً على اللوحة نفسها.

[green]منفذ M.2 من المعالج بالجيل الرابع:[/green] بكامل سرعته.

[green]مخرجا HDMI وDisplayPort:[/green] للرسوميات المدمجة في معالجات مثل 8600G.

[green]ذاكرة DDR5 حتى 6400 كسر سرعة:[/green] أطقم 6000 تعمل بملفّ EXPO.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2 واحد ومنفذا ذاكرة فقط.
* مراحل طاقة بسيطة، فالأنسب لها معالجات 65 واط مثل 7600 و9600. المعالجات العليا قد تُخفَّض سرعتها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا واي‑فاي، وشبكة 1 جيجابت فقط، ولا كسر سرعة للمعالج.

---
بإمكانك التوجه إلى [Gigabyte B650M DS3H](/components/cmpiec87q003900ymbge1evlg) إذا كان توجهك يتركز على الآتي:
* لوحة B650 بمنفذي M.2 وأربع فتحات ذاكرة، وفرق السعر صغير.
https://www.gigabyte.com/Motherboard/A620M-H-rev-10/sp`,
  },
  {
    id: 'cmuzkkh91000ru4ymn940fnmy',
    description: `### MSI B860M Gaming Plus WiFi

لوحة Micro-ATX لمعالجات Core Ultra بشبكةٍ أسرع من فئتها: 5 جيجابت من Intel Killer، مع واي‑فاي 7. تناسب جهاز ألعابٍ حديثاً متّصلاً بشبكةٍ سريعة.

**التقنيات الأساسية المدعومة:**

[green]شبكة Intel Killer E5000 بسرعة 5 جيجابت:[/green] ضعف الشبكة المعتادة في هذه الفئة، وتفيد في نقل الملفّات داخل المنزل.

[green]واي‑فاي 7 (Killer BE1750x):[/green] أحدث معيار لاسلكيّ.

[green]PCIe 5.0 للكرت والتخزين:[/green] فتحة الكرت x16 وأوّل منفذ M.2 بالجيل الخامس.

[green]أربع فتحات DDR5 حتى 256 جيجابايت:[/green] بسرعة تصل إلى 8800 كسر سرعة، مع دعم ذاكرة CUDIMM.

[green]ثلاثة منافذ M.2.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2 الثالث بالجيل الرابع x2.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا كسر سرعة للمعالج (B860).
* حجم Micro-ATX: فتحات توسعة أقلّ من لوحات ATX.

---
بإمكانك التوجه إلى [MSI PRO B860-P WiFi](/components/cmr2k5vx40006jgym04l2zz5r) إذا كان توجهك يتركز على الآتي:
* لوحة ATX بالحجم الكامل من MSI.
https://www.msi.com/Motherboard/B860M-GAMING-PLUS-WIFI/Specification`,
  },
  {
    id: 'cmuzkkh0r000ou4ymebg8zy5e',
    description: `### ASUS PRIME B860M-K

من أرخص لوحات B860 في الكتالوج لمعالجات Core Ultra: الأساسيّات بلا زيادة. تناسب تجميعة Intel حديثة اقتصاديّة متّصلة بكابل.

**التقنيات الأساسية المدعومة:**

[green]منفذ M.2 بالجيل الخامس من المعالج:[/green] ومنفذٌ ثانٍ بالجيل الرابع.

[green]DDR5 بسرعة 8800 فما فوق كسر سرعة:[/green] مع دعم ذاكرة CUDIMM.

[green]شبكة Realtek بسرعة 2.5 جيجابت.[/green]

[green]مقبس LGA1851:[/green] لمعالجات Core Ultra (السلسلة 2).

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحة الكرت PCIe 4.0 لا 5.0. لا فرق يُذكر مع كروت اليوم، لكنّها نقطة الفرق عن لوحات B860 الأغلى.
* فتحتا ذاكرة فقط (حتى 128 جيجابايت).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا واي‑فاي مدمج.

---
بإمكانك التوجه إلى [ASRock B860M Pro RS WiFi](/components/cmr2k5w2s0007jgym4ibatlpn) إذا كان توجهك يتركز على الآتي:
* واي‑فاي مدمج وفتحة كرتٍ بالجيل الخامس.
https://www.asus.com/motherboards-components/motherboards/prime/prime-b860m-k/techspec/`,
  },
  {
    id: 'cmuzkkfen0006u4ympd4lej5s',
    description: `### Gigabyte B850M DS3H

من أرخص لوحات B850 بأربع فتحات ذاكرة في الكتالوج: الأساسيّات الكاملة لمنصّة Ryzen الحديثة بلا زيادة. أساسٌ قويّ لتجميعة ألعابٍ بمعالج Ryzen 7 أو 9.

**التقنيات الأساسية المدعومة:**

[green]PCIe 5.0 للكرت:[/green] فتحة الكرت الرئيسيّة من المعالج بالجيل الخامس، ومنفذا M.2 من المعالج أيضاً.

[green]أربع فتحات DDR5 حتى 256 جيجابايت:[/green] بسرعة تصل إلى 8200 كسر سرعة.

[green]كسر سرعة المعالج والذاكرة:[/green] شيبست B850 يسمح بـPrecision Boost Overdrive وملفّات EXPO.

[green]شبكة Realtek بسرعة 2.5 جيجابت.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذا M.2 فقط.
* الفتحة الثانية للكرت بالجيل الثالث x4، فهي للبطاقات الصغيرة لا لكرتٍ ثانٍ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا واي‑فاي مدمج.

---
بإمكانك التوجه إلى [Gigabyte B650M DS3H](/components/cmpiec87q003900ymbge1evlg) إذا كان توجهك يتركز على الآتي:
* اللوحة نفسها بشيبست B650: فتحة كرتٍ بالجيل الرابع، وفرق سعرٍ صغير.
https://www.gigabyte.com/Motherboard/B850M-DS3H-rev-10/sp`,
  },
  {
    id: 'cmuzv426h000lpcymakc3zdxd',
    description: `### MSI PRO Z890-S WiFi

مدخل MSI الاقتصاديّ إلى شيبست Z890 بحجم ATX: كسر سرعة معالجات K، وواي‑فاي 7، ومنفذ Thunderbolt 4. تناسب تجميعة Core Ultra 5 أو 7 K لمن يريد مزايا Z890 بأقلّ كلفة.

**التقنيات الأساسية المدعومة:**

[green]شيبست Z890:[/green] كسر سرعة المعالج والذاكرة لمعالجات K.

[green]منفذ Thunderbolt 4:[/green] منفذ Type-C بسرعة 40 جيجابت يحمل صورةً، لأقراص خارجيّة سريعة أو محطّات توصيل.

[green]ثلاثة منافذ M.2:[/green] الأوّل بالجيل الخامس، مع أربعة منافذ SATA.

[green]واي‑فاي 7 وشبكة 2.5 جيجابت.[/green]

[green]DDR5 حتى 8800 كسر سرعة.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* شريحة صوت Realtek ALC897 أساسيّة.
* مراحل طاقة اقتصاديّة، فلا تناسب كسر سرعة Core Ultra 9 تحت حملٍ طويل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ثلاثة منافذ M.2 فقط.

---
بإمكانك التوجه إلى [Gigabyte Z890 UD WiFi6E](/components/cmuzs9zm6000lu8ym46h4fsch) إذا كان توجهك يتركز على الآتي:
* لوحة Z890 اقتصاديّة أخرى بمنفذ USB4.
https://www.msi.com/Motherboard/PRO-Z890-S-WIFI/Specification`,
  },
  {
    id: 'cmsq8f4r60002ioymk3l5hcml',
    description: `### MSI PRO A620M-E

لوحة A620 من خطّ PRO المكتبيّ: تركّز على الثبات لا على الزينة، وتقبل ذاكرةً أسرع ممّا تَعِد به فئتها. تناسب جهازاً مكتبيّاً أو تجميعة ألعابٍ اقتصاديّة مع Ryzen 5 7500F أو 7600.

**التقنيات الأساسية المدعومة:**

[green]DDR5 حتى 6000 فما فوق كسر سرعة:[/green] أعلى من الأساس 4800، وهي السرعة التي تستفيد منها معالجات Ryzen 7000 و9000 فعلاً.

[green]منفذ M.2 بالجيل الرابع x4:[/green] متّصل بالمعالج مباشرةً، فيعمل بكامل سرعته.

[green]مقبس AM5:[/green] مسار ترقيةٍ مفتوح حتى Ryzen 9000 وما بعده.

[green]مخارج صورة للرسوميات المدمجة:[/green] لمعالجات Ryzen ذات الرسوميات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحتا ذاكرة فقط بسقف 96 جيجابايت.
* منفذ M.2 واحد.
* لا كسر سرعة للمعالج (A620)، وحدّ المعالج المدعوم قرابة 200 واط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا واي‑فاي مدمج.
* منفذ DVI في اللوحة الخلفيّة، وهو معيارٌ قديم لا يفيد الشاشات الحديثة.

---
بإمكانك التوجه إلى [Gigabyte B650M DS3H](/components/cmpiec87q003900ymbge1evlg) إذا كان توجهك يتركز على الآتي:
* أربع فتحات ذاكرة ومنفذا M.2 وكسر سرعة المعالج، بفرق سعرٍ صغير.
https://www.msi.com/Motherboard/PRO-A620M-E`,
  },
  {
    id: 'cmuzv42g1000opcyme09eq9as',
    description: `### Gigabyte X870 AORUS Elite WiFi7 ICE

النسخة البيضاء من لوحة X870 AORUS Elite: أربعة منافذ M.2، ومنفذا USB4، وواي‑فاي 7. أساسٌ لتجميعة Ryzen بيضاء قويّة بمعالج 9800X3D أو 9950X.

**التقنيات الأساسية المدعومة:**

[green]أربعة منافذ M.2:[/green] مع أربعة منافذ SATA، مساحةٌ لأقراصٍ كثيرة.

[green]منفذا USB4 بسرعة 40 جيجابت:[/green] يحملان صورةً مع المعالجات ذات الرسوميات المدمجة، ويصلان الأقراص الخارجيّة السريعة.

[green]PCIe 5.0 للكرت والتخزين:[/green] مع Ryzen 9000 و7000.

[green]واي‑فاي 7 وشبكة 2.5 جيجابت.[/green]

[green]DDR5 حتى 8200 كسر سرعة:[/green] أربع فتحات حتى 256 جيجابايت.

[green]تصميم أبيض:[/green] مشتّتات ودروعٌ بيضاء تناسب التجميعات البيضاء.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* شبكة سلكيّة 2.5 جيجابت فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* اللون الأبيض يرفع السعر دون فرقٍ في الأداء.

---
بإمكانك التوجه إلى [Gigabyte X870 AORUS Elite WiFi7](/components/cmpiec6p9003400ymwohd55y3) إذا كان توجهك يتركز على الآتي:
* اللوحة نفسها بالأسود، وسعرها أقلّ عادةً.
https://www.gigabyte.com/Motherboard/X870-AORUS-ELITE-WIFI7-ICE-rev-10-11/sp`,
  },
  {
    id: 'cmuzv41x7000ipcymaclyvrjz',
    description: `### MSI MAG Z890 Tomahawk WiFi

لوحة Tomahawk لشيبست Z890: شبكة Killer بسرعة 5 جيجابت، ومنفذا Thunderbolt 4، ومراحل طاقة متينة. تناسب تجميعة Core Ultra 7 أو 9 K لمن يريد كسر السرعة وتوصيلاً سريعاً.

**التقنيات الأساسية المدعومة:**

[green]شبكة Intel Killer E5000B بسرعة 5 جيجابت:[/green] وواي‑فاي 7.

[green]منفذا Thunderbolt 4:[/green] 40 جيجابت مع صورة.

[green]أربعة منافذ M.2:[/green] الأوّل بالجيل الخامس من المعالج، مع أربعة منافذ SATA.

[green]DDR5 حتى 9200 كسر سرعة:[/green] من أعلى الأرقام في فئتها.

[green]مراحل طاقة متينة:[/green] تتحمّل معالجات Core Ultra 9 تحت الحمل الطويل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحتا التوسعة الإضافيّتان من الشيبست بالجيل الرابع x4.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا منفذ M.2 ثانٍ من الجيل الخامس.

---
بإمكانك التوجه إلى [MSI PRO Z890-A WiFi](/components/cmuzs9yft0009u8ymvn1y50lx) إذا كان توجهك يتركز على الآتي:
* المزايا نفسها تقريباً (Thunderbolt 4 وشبكة 5 جيجابت) بسعرٍ أقلّ عادةً.
https://www.msi.com/Motherboard/MAG-Z890-TOMAHAWK-WIFI/Specification`,
  },
];
// ---------------------------------------------------------------- التنفيذ
const backup = [];
let bad = 0;
for (const r of REWRITE) {
  const c = await prisma.component.findUnique({ where: { id: r.id }, select: { id: true, name: true, description: true, specs: true } });
  if (!c) { console.log(`✗ ${r.id} غير موجود`); bad++; continue; }
  const d = r.description;
  const errs = [];
  if (/\*\*\[(yellow|red)/.test(d)) errs.push('نجوم حول وسم اللون');
  if (!/^https?:\/\/\S+$/.test(d.trim().split('\n').pop())) errs.push('السطر الأخير ليس رابطاً');
  if (!d.startsWith('### ')) errs.push('لا عنوان');
  for (const m of d.matchAll(/\]\(\/components\/([a-z0-9]+)\)/g)) {
    if (!(await prisma.component.findUnique({ where: { id: m[1] }, select: { id: true } }))) errs.push(`بديلٌ مفقود ${m[1]}`);
  }
  if (d.length <= (c.description || '').length) errs.push(`ليس أطول (${d.length} ≤ ${c.description.length})`);
  console.log(`${errs.length ? '✗' : '✔'} ${c.name}: ${(c.description || '').length} → ${d.length}${r.specs ? ' + مواصفات ' + JSON.stringify(r.specs) : ''}${errs.length ? '  ⟵ ' + errs.join('، ') : ''}`);
  if (errs.length) bad++;
  backup.push(c);
}
if (bad) { console.log(`\n${bad} خطأ — لم يُنفَّذ شيء`); process.exit(1); }
if (apply) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  writeFileSync(`backups/desc-${TAG}-${stamp}.json`, JSON.stringify(backup, null, 2));
  for (const r of REWRITE) {
    const c = backup.find((b) => b.id === r.id);
    const specs = r.specs ? { ...(typeof c.specs === 'string' ? JSON.parse(c.specs) : c.specs), ...r.specs } : undefined;
    await prisma.component.update({ where: { id: r.id }, data: { description: r.description, ...(specs ? { specs } : {}) } });
  }
  console.log(`\nنُفّذ ${REWRITE.length} — النسخة في backups/desc-${TAG}-${stamp}.json`);
} else console.log(`\n${REWRITE.length} وصفاً — (عرضٌ فقط — أضف --apply)`);
await prisma.$disconnect();
