/* فحصُ حرّاس كاتب الأوصاف — يُشغَّل بلا مفتاحٍ وبلا كلفة.
 *   npx tsx scripts/describe-check.ts
 */
import { checkDraft } from '../lib/describe';

const peers = new Set(['peerA', 'peerB']);
const ok = `### ASUS X

فقرةٌ تعريفيّة كافيةُ الطول لتتجاوز الحدّ الأدنى المفروض على المسوّدة، وفيها ما يميّز القطعة عن غيرها في الكتالوج بوضوحٍ تامّ وبلا مبالغة.

التقنيات الأساسية المدعومة:

[green]ميزة:[/green] تفصيل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بند.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بند.

---
بإمكانك التوجه إلى [بديل](/components/peerA) إذا كان توجهك يتركز على الآتي:
* سبب.`;

const cases: Array<[string, string, string | null]> = [
  ['مسوّدةٌ سليمة', ok, null],
  ['معرّفٌ مخترَع', ok.replace('peerA', 'zzINVENTEDzz'), 'معرّفٌ ليس من قائمة البدائل'],
  ['يربط نفسه', ok.replace('peerA', 'selfX'), 'يربط القطعة بنفسها'],
  ['بلا بديل', ok.split('---')[0], 'بلا بديلٍ مرتبط'],
  ['ينقصه الأصفر', ok.replace(/\[yellow\][\s\S]*?\[red\]/, '[red]'), 'ينقصه قسم [yellow]'],
  ['أسوار كود', '```\n' + ok + '\n```', 'فيه أسوار كود'],
  ['قصيرٌ جدّاً', '### X\n\nقصير.', 'قصيرٌ جدّاً'],
];

let bad = 0;
for (const [label, text, want] of cases) {
  const got = checkDraft(text, { category: 'GPU', peerIds: peers, selfId: 'selfX' });
  const hit = want === null ? got.length === 0 : got.some((p) => p.includes(want));
  if (!hit) { bad++; console.log('✗ ' + label + ' → ' + JSON.stringify(got)); }
  else console.log('✔ ' + label + (want ? '  ← ' + got[0] : ''));
}
console.log(bad === 0 ? '\nنجحت ' + cases.length + ' حالة' : '\nفشل ' + bad);
process.exit(bad ? 1 : 0);
