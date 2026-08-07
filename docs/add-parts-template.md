# إضافة قطع جديدة — القالب المرجعي

مستخرج من الكتالوج الفعلي (٢٢٤ قطعة)، فما تُضاف قطعة ناقصة عن أخواتها.

## القاعدة الذهبية

المفاتيح المعلَّمة **🔑 وظيفي** يقرأها الكود بالحرف: التوافق، التوصية، حاسبة الطاقة.
كتابتها بصيغة مختلفة (`VRAM` بدل `vram`، `length` بدل `lengthMm`) = القطعة تُعرض للزائر
لكنها **غير مرئية للمنطق**: لا تُفحص مقاساتها ولا تُرشَّح في «ماتدري وش تختار؟».

المعلَّمة **📄 عرض** تظهر في جدول المواصفات فقط — تنقصها لا يكسر شيئاً، لكن القطعة تبدو أفقر.

---

## الحقول المشتركة لكل القطع

| الحقل | إلزامي | ملاحظات |
|---|---|---|
| `categoryId` | ✅ | من الجدول أدناه |
| `brand` | ✅ | NVIDIA · AMD · Intel · Corsair … |
| `name` | ✅ | بلا اسم الشركة (يُعرض بجانبه) — مثال: `GeForce RTX 5070 12GB` |
| `price` | ✅ | رقم فقط. يُعاد حسابه تلقائياً من أرخص متجر عند أول سحب |
| `tdpWattage` | ✅ للمعالج/الكرت/اللوحة | واط. الكيس والمزوّد = `0` |
| `performanceTier` | ✅ 1–5 | **الاستيراد يرفض** CPU/GPU/Motherboard/PSU/Storage بلا مستوى |
| `imageUrl` | مستحسن | ١٠٠٪ من قطعك عندها صورة |
| `description` | مستحسن | ١٠٠٪ من قطعك عندها وصف |
| `specs` | ✅ | حسب الفئة أدناه |

### معرّفات الفئات

```
CPU          cmpfziqb20000x4ymfmkovawm
Motherboard  cmpfziqe70001x4ym928tt3o2
PSU          cmpfziqh70002x4ym6ln587z2
RAM          cmpfziqks0003x4yma730h1be
GPU          cmpfziqnv0004x4ymffnp204c
Storage      cmpfziqr70005x4ym3k7uh079
Case         cmpfziquj0006x4ym53f0ehcw
```

---

## المواصفات لكل فئة

### 🔲 CPU
```json
{ "socket": "AM5", "cores": "8", "threads": "16",
  "baseClock": "4.7", "boostClock": "5.5" }
```
- 🔑 `socket` — واحدة من: `AM5` `AM4` `LGA1700` `LGA1851` `LGA1200`
- 🔑 `cores` `threads` — أرقام مجرّدة
- 📄 `baseClock` `boostClock` — بالجيجاهرتز
- 📄 اختياري: `L3 Cache` · `P-Cores` · `E-Cores` · `integratedGraphics`

### 🔳 Motherboard
```json
{ "socket": "AM5", "chipset": "B650", "ramType": "DDR5",
  "formFactor": "ATX", "maxRam": "192GB", "m2Slots": "3", "pcieVersion": "PCIe 5.0" }
```
- 🔑 `socket` — **يجب أن يطابق نص مقبس المعالج حرفياً**
- 🔑 `ramType` — `DDR5` أو `DDR4`
- 🔑 `chipset` · 📄 `formFactor` (`ATX` `Micro-ATX` `Mini-ITX` `E-ATX`) · `maxRam` · `m2Slots` · `pcieVersion`

### 🎮 GPU
```json
{ "vram": "12GB", "lengthMm": "285", "memoryType": "GDDR7",
  "memoryBus": "192-bit", "interface": "PCIe 5.0 x16",
  "powerConnectors": "1x 16-pin", "ports": "1x HDMI 2.1, 3x DP 2.1a",
  "architecture": "Blackwell" }
```
- 🔑 `vram` — يُقبل `VRAM` أيضاً، لكن **الزم `vram`**
- 🔑 `lengthMm` — **رقم بالملم فقط.** ⚠️ `length` **لا يُقرأ** فيسقط فحص «هل يدخل الكيس؟»
- 📄 الباقي

### 📊 RAM
```json
{ "type": "DDR5", "capacity": "32GB", "speed": "6000",
  "kit": "2x16GB", "Cas Latency": "CL30", "Profile": "Intel XMP 3.0", "RGB": "No" }
```
- 🔑 `type` · `capacity` (السعة **الإجمالية**) · `speed`
- 📄 `kit` `Cas Latency` `Profile` `RGB` `Color`

### 💾 Storage
```json
{ "type": "NVMe M.2", "capacity": "2TB", "interface": "PCIe 4.0 x4",
  "formFactor": "M.2 2280", "readSpeed": "7300 MB/s", "writeSpeed": "6900 MB/s" }
```
- 🔑 `type` (`NVMe M.2` `SATA SSD` `HDD`) · `capacity` · `readSpeed`
- 📄 `interface` `formFactor` `writeSpeed`

### ⚡ PSU
```json
{ "wattage": "850", "rating": "80+ Gold", "formFactor": "ATX 3.0", "modularity": "Full" }
```
- 🔑 `wattage` — رقم مجرّد بلا `W`
- 📄 `rating` (`80+ Bronze` `Gold` `Platinum` `Titanium`) · `formFactor` · `modularity`

### 🗄️ Case
```json
{ "formFactor": "Mid Tower", "maxGpuLength": "400" }
```
- 🔑 `maxGpuLength` — رقم بالملم. بدونه يقبل الكيس أي كرت
- 📄 `formFactor` · `Included Fans` · `Radiator Support` · `Airflow`
- `tdpWattage: 0` و`performanceTier` غير مطلوب

---

## روابط المتاجر

عمود لكل متجر بمعرّفه النصّي (`slug`)، والاستيراد يقبل الشكلين:

```json
{ "amazonUrl": "https://www.amazon.sa/dp/XXXXXXXXXX",
  "amazonPrice": 3248, "amazonInStock": true,
  "microlessUrl": "https://saudi.microless.com/product/...",
  "noonUrl": "https://www.noon.com/saudi-ar/..." }
```

المتاجر الحالية: `amazon` · `cazasouq` · `microless` · `noon`
اترك المتجر الذي لا رابط له — لا تضع سلسلة فارغة.

---

## طريقتان للإضافة

**١. لوحة الإدارة** — «إدارة القطع» ← املأ النموذج. حقول المواصفات تظهر تلقائياً حسب الفئة،
وحقول المتاجر تتولّد لكل متجر مفعّل.

**٢. الاستيراد دفعةً** — `/admin/import` وألصق مصفوفة JSON بالشكل أعلاه. أسرع لعشر قطع فأكثر.

---

## لو أردت أن أجهّزها لك

أرسل لكل منتج:
1. **الاسم الكامل** كما في المتجر
2. **رابط المنتج** في متجر واحد على الأقل
3. **الفئة**

وأُخرج لك JSON جاهزاً للصق في الاستيراد، بكل المواصفات مملوءة ومطابقة لصيغة كتالوجك.
