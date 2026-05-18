(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/PCBuilderClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PCBuilderClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$html2canvas$2f$dist$2f$html2canvas$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/html2canvas/dist/html2canvas.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const SearchableSelect = ({ category, selectedComponent, onSelect, onShowDetails })=>{
    _s();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const wrapperRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SearchableSelect.useEffect": ()=>{
            function handleClickOutside(event) {
                if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return ({
                "SearchableSelect.useEffect": ()=>document.removeEventListener("mousedown", handleClickOutside)
            })["SearchableSelect.useEffect"];
        }
    }["SearchableSelect.useEffect"], []);
    const filteredComponents = category.components.filter((c)=>`${c.brand} ${c.name}`.toLowerCase().includes(searchTerm.toLowerCase()));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative flex-1",
        ref: wrapperRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 cursor-pointer flex justify-between items-center",
                onClick: ()=>setIsOpen(!isOpen),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "truncate text-gray-800 dark:text-gray-100",
                        children: selectedComponent ? `${selectedComponent.brand} ${selectedComponent.name} - $${selectedComponent.price}` : `-- اختر ${category.name} --`
                    }, void 0, false, {
                        fileName: "[project]/components/PCBuilderClient.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-gray-500",
                        children: "▼"
                    }, void 0, false, {
                        fileName: "[project]/components/PCBuilderClient.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/PCBuilderClient.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-2 border-b border-gray-100 dark:border-slate-700",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            className: "w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white",
                            placeholder: `ابحث في ${category.name}...`,
                            value: searchTerm,
                            onChange: (e)=>setSearchTerm(e.target.value),
                            onClick: (e)=>e.stopPropagation(),
                            autoFocus: true
                        }, void 0, false, {
                            fileName: "[project]/components/PCBuilderClient.tsx",
                            lineNumber: 69,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/PCBuilderClient.tsx",
                        lineNumber: 68,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "max-h-60 overflow-y-auto",
                        children: filteredComponents.length > 0 ? filteredComponents.map((comp)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "p-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center border-b border-gray-50 dark:border-slate-700/50 last:border-0",
                                onClick: ()=>{
                                    onSelect(comp.id);
                                    setIsOpen(false);
                                    setSearchTerm('');
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-800 dark:text-gray-200",
                                        children: [
                                            comp.brand,
                                            " ",
                                            comp.name
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PCBuilderClient.tsx",
                                        lineNumber: 91,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-bold text-blue-600 dark:text-blue-400",
                                                children: [
                                                    "$",
                                                    comp.price
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/PCBuilderClient.tsx",
                                                lineNumber: 93,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: (e)=>{
                                                    e.stopPropagation();
                                                    onShowDetails(comp);
                                                },
                                                className: "px-2 py-1 text-xs bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-white rounded",
                                                children: "التفاصيل"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PCBuilderClient.tsx",
                                                lineNumber: 94,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PCBuilderClient.tsx",
                                        lineNumber: 92,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, comp.id, true, {
                                fileName: "[project]/components/PCBuilderClient.tsx",
                                lineNumber: 82,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0))) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            className: "p-3 text-gray-500 text-center",
                            children: "لا توجد نتائج متوافقة"
                        }, void 0, false, {
                            fileName: "[project]/components/PCBuilderClient.tsx",
                            lineNumber: 107,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/PCBuilderClient.tsx",
                        lineNumber: 79,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/PCBuilderClient.tsx",
                lineNumber: 67,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/PCBuilderClient.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(SearchableSelect, "rfqhJLGE9JZsNbLSy1nBzkfKygs=");
_c = SearchableSelect;
function PCBuilderClient({ categories }) {
    _s1();
    const [selectedComponents, setSelectedComponents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        status: 'idle',
        message: '',
        totalTdp: 0,
        totalPrice: 0
    });
    const [detailsModal, setDetailsModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const resultRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const handleSelect = (categoryName, componentId)=>{
        const category = categories.find((c)=>c.name === categoryName);
        const component = category?.components.find((c)=>c.id === componentId) || null;
        setSelectedComponents((prev)=>({
                ...prev,
                [categoryName]: component
            }));
    };
    const parseSpecs = (specsStr)=>{
        if (!specsStr) return {};
        return typeof specsStr === 'string' ? JSON.parse(specsStr) : specsStr;
    };
    const getFilteredComponents = (categoryName, components)=>{
        const cpu = selectedComponents['CPU'];
        const mobo = selectedComponents['Motherboard'];
        const ram = selectedComponents['RAM'];
        const gpu = selectedComponents['GPU'];
        const pcCase = selectedComponents['Case'];
        return components.filter((comp)=>{
            const specs = parseSpecs(comp.specs);
            if (categoryName === 'Motherboard') {
                if (cpu) {
                    const cpuSpecs = parseSpecs(cpu.specs);
                    if (specs.socket && cpuSpecs.socket && specs.socket !== cpuSpecs.socket) return false;
                }
                if (ram) {
                    const ramSpecs = parseSpecs(ram.specs);
                    if (specs.ramType && ramSpecs.type && specs.ramType !== ramSpecs.type) return false;
                }
            }
            if (categoryName === 'CPU' && mobo) {
                const moboSpecs = parseSpecs(mobo.specs);
                if (specs.socket && moboSpecs.socket && specs.socket !== moboSpecs.socket) return false;
            }
            if (categoryName === 'RAM' && mobo) {
                const moboSpecs = parseSpecs(mobo.specs);
                if (specs.type && moboSpecs.ramType && specs.type !== moboSpecs.ramType) return false;
            }
            if (categoryName === 'Case' && gpu) {
                const gpuSpecs = parseSpecs(gpu.specs);
                if (specs.maxGpuLength && gpuSpecs.lengthMm && parseFloat(specs.maxGpuLength) < parseFloat(gpuSpecs.lengthMm)) return false;
            }
            if (categoryName === 'GPU' && pcCase) {
                const caseSpecs = parseSpecs(pcCase.specs);
                if (specs.lengthMm && caseSpecs.maxGpuLength && parseFloat(specs.lengthMm) > parseFloat(caseSpecs.maxGpuLength)) return false;
            }
            return true;
        });
    };
    const checkCompatibility = ()=>{
        const cpu = selectedComponents['CPU'];
        const mobo = selectedComponents['Motherboard'];
        const ram = selectedComponents['RAM'];
        const gpu = selectedComponents['GPU'];
        const pcCase = selectedComponents['Case'];
        const psu = selectedComponents['PSU'];
        let totalTdp = 0;
        let totalPrice = 0;
        Object.values(selectedComponents).forEach((comp)=>{
            if (comp) {
                totalTdp += comp.tdpWattage;
                totalPrice += comp.price;
            }
        });
        if (!cpu || !mobo || !ram || !gpu || !pcCase || !psu) {
            setResult({
                status: 'error',
                message: 'الرجاء اختيار القطع الأساسية (CPU, Motherboard, RAM, GPU, Case, PSU) للتحقق.',
                totalTdp,
                totalPrice
            });
            return;
        }
        const cpuSpecs = parseSpecs(cpu.specs);
        const moboSpecs = parseSpecs(mobo.specs);
        const ramSpecs = parseSpecs(ram.specs);
        const gpuSpecs = parseSpecs(gpu.specs);
        const caseSpecs = parseSpecs(pcCase.specs);
        const psuSpecs = parseSpecs(psu.specs);
        if (cpuSpecs?.socket !== moboSpecs?.socket) {
            setResult({
                status: 'error',
                message: `عدم توافق: المعالج بمقبس ${cpuSpecs?.socket} واللوحة الأم بمقبس ${moboSpecs?.socket}.`,
                totalTdp,
                totalPrice
            });
            return;
        }
        if (ramSpecs?.type !== moboSpecs?.ramType) {
            setResult({
                status: 'error',
                message: `عدم توافق: اللوحة الأم تدعم ${moboSpecs?.ramType} والرام المختار من نوع ${ramSpecs?.type}.`,
                totalTdp,
                totalPrice
            });
            return;
        }
        if (gpuSpecs?.lengthMm > caseSpecs?.maxGpuLength) {
            setResult({
                status: 'error',
                message: `عدم توافق: طول كرت الشاشة (${gpuSpecs?.lengthMm}mm) أكبر من المساحة المتاحة في الكيس (${caseSpecs?.maxGpuLength}mm).`,
                totalTdp,
                totalPrice
            });
            return;
        }
        const requiredWattage = totalTdp + 100;
        if (psuSpecs?.wattage < requiredWattage) {
            setResult({
                status: 'error',
                message: `تحذير طاقة: الاستهلاك التقريبي مع هامش الأمان (${requiredWattage} واط) يتجاوز قدرة مزود الطاقة (${psuSpecs?.wattage} واط).`,
                totalTdp,
                totalPrice
            });
            return;
        }
        setResult({
            status: 'success',
            message: 'تم التوافق! جميع القطع متوافقة تماماً.',
            totalTdp,
            totalPrice
        });
    };
    const exportBuildAsImage = async ()=>{
        if (!resultRef.current) return;
        try {
            const canvas = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$html2canvas$2f$dist$2f$html2canvas$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(resultRef.current, {
                backgroundColor: '#0f172a'
            });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = "My-PC-Build.png";
            link.click();
        } catch (error) {
            console.error("خطأ في تصدير الصورة:", error);
        }
    };
    const renderSpecs = (specsStr)=>{
        if (!specsStr) return "لا توجد تفاصيل إضافية.";
        try {
            const parsed = parseSpecs(specsStr);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "list-disc list-inside space-y-1 mt-2 text-gray-700 dark:text-gray-300",
                children: Object.entries(parsed).map(([key, value])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold capitalize",
                                children: [
                                    key,
                                    ":"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PCBuilderClient.tsx",
                                lineNumber: 250,
                                columnNumber: 27
                            }, this),
                            " ",
                            String(value)
                        ]
                    }, key, true, {
                        fileName: "[project]/components/PCBuilderClient.tsx",
                        lineNumber: 250,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/PCBuilderClient.tsx",
                lineNumber: 248,
                columnNumber: 9
            }, this);
        } catch (e) {
            return String(specsStr);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-5xl mx-auto mt-10 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gradient-to-r from-blue-900 to-blue-700 dark:from-slate-800 dark:to-slate-900 p-8 text-center text-white rounded-t-2xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold mb-2 flex items-center justify-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "💻"
                            }, void 0, false, {
                                fileName: "[project]/components/PCBuilderClient.tsx",
                                lineNumber: 263,
                                columnNumber: 11
                            }, this),
                            " منصة بناء أجهزة الـ PC"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PCBuilderClient.tsx",
                        lineNumber: 262,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-blue-100 dark:text-gray-300 text-sm",
                        children: "اختر القطع، ابحث عنها، وتأكد من توافقها"
                    }, void 0, false, {
                        fileName: "[project]/components/PCBuilderClient.tsx",
                        lineNumber: 265,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PCBuilderClient.tsx",
                lineNumber: 261,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-8 mb-8",
                        children: categories.map((category)=>{
                            const filteredCategory = {
                                ...category,
                                components: getFilteredComponents(category.name, category.components)
                            };
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-2 h-2 rounded-full bg-blue-500"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PCBuilderClient.tsx",
                                                lineNumber: 275,
                                                columnNumber: 19
                                            }, this),
                                            category.name
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PCBuilderClient.tsx",
                                        lineNumber: 274,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-3 items-center",
                                        children: [
                                            selectedComponents[category.name]?.imageUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: selectedComponents[category.name]?.imageUrl,
                                                alt: selectedComponents[category.name]?.name,
                                                className: "w-14 h-14 rounded-lg object-contain bg-white dark:bg-slate-800 border p-1 shadow-sm"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PCBuilderClient.tsx",
                                                lineNumber: 280,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SearchableSelect, {
                                                category: filteredCategory,
                                                selectedComponent: selectedComponents[category.name],
                                                onSelect: (id)=>handleSelect(category.name, id),
                                                onShowDetails: (comp)=>setDetailsModal({
                                                        comp,
                                                        categoryName: category.name
                                                    })
                                            }, void 0, false, {
                                                fileName: "[project]/components/PCBuilderClient.tsx",
                                                lineNumber: 286,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PCBuilderClient.tsx",
                                        lineNumber: 278,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, category.id, true, {
                                fileName: "[project]/components/PCBuilderClient.tsx",
                                lineNumber: 273,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/PCBuilderClient.tsx",
                        lineNumber: 269,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: checkCompatibility,
                        className: "w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition-all shadow-md",
                        children: "تحقق من التوافقية"
                    }, void 0, false, {
                        fileName: "[project]/components/PCBuilderClient.tsx",
                        lineNumber: 298,
                        columnNumber: 9
                    }, this),
                    result.status !== 'idle' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8 relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                ref: resultRef,
                                className: `p-6 rounded-xl border ${result.status === 'success' ? 'bg-green-50 dark:bg-slate-800 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-start gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-2xl",
                                            children: result.status === 'success' ? '✅' : '❌'
                                        }, void 0, false, {
                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                            lineNumber: 309,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: `text-lg font-bold mb-2 ${result.status === 'success' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`,
                                                    children: result.message
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                                    lineNumber: 311,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-4 flex gap-4 text-sm font-bold text-gray-800 dark:text-gray-200",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                "⚡ الطاقة المطلوبة: ",
                                                                result.totalTdp,
                                                                "W"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                                            lineNumber: 315,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                "💰 التكلفة الإجمالية: $",
                                                                result.totalPrice
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                                            lineNumber: 316,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                                    lineNumber: 314,
                                                    columnNumber: 19
                                                }, this),
                                                result.status === 'success' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-6 pt-6 border-t border-green-200 dark:border-green-800/50",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            className: "font-bold text-green-900 dark:text-green-400 mb-4",
                                                            children: "🛒 قطع التجميعة المتوافقة:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                                            lineNumber: 321,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-3",
                                                            children: Object.entries(selectedComponents).map(([catName, comp])=>{
                                                                if (!comp) return null;
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700/50 gap-3",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-sm",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "font-bold text-gray-400 dark:text-gray-500 ml-2",
                                                                                    children: [
                                                                                        "[",
                                                                                        catName,
                                                                                        "]"
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                                                                    lineNumber: 328,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-gray-900 dark:text-gray-100 font-medium",
                                                                                    children: [
                                                                                        comp.brand,
                                                                                        " ",
                                                                                        comp.name
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                                                                    lineNumber: 329,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                                                            lineNumber: 327,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex gap-2",
                                                                            "data-html2canvas-ignore": true,
                                                                            children: [
                                                                                comp.amazonUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                                    href: comp.amazonUrl,
                                                                                    target: "_blank",
                                                                                    rel: "noopener noreferrer",
                                                                                    className: "px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-md font-bold transition-colors shadow-sm",
                                                                                    children: "أمازون"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                                                                    lineNumber: 333,
                                                                                    columnNumber: 35
                                                                                }, this),
                                                                                comp.cazasouqUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                                    href: comp.cazasouqUrl,
                                                                                    target: "_blank",
                                                                                    rel: "noopener noreferrer",
                                                                                    className: "px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md font-bold transition-colors shadow-sm",
                                                                                    children: "كازاسوق"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                                                                    lineNumber: 338,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                                                            lineNumber: 331,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, catName, true, {
                                                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                                                    lineNumber: 326,
                                                                    columnNumber: 29
                                                                }, this);
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                                            lineNumber: 322,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                                    lineNumber: 320,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                            lineNumber: 310,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                    lineNumber: 308,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/PCBuilderClient.tsx",
                                lineNumber: 307,
                                columnNumber: 13
                            }, this),
                            result.status === 'success' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 flex justify-end",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: exportBuildAsImage,
                                    className: "px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-md",
                                    children: "📸 حفظ التجميعة كصورة"
                                }, void 0, false, {
                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                    lineNumber: 355,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/PCBuilderClient.tsx",
                                lineNumber: 354,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PCBuilderClient.tsx",
                        lineNumber: 306,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PCBuilderClient.tsx",
                lineNumber: 268,
                columnNumber: 7
            }, this),
            detailsModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-center p-4 border-b dark:border-slate-800 bg-gray-50 dark:bg-slate-800",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "font-bold text-xl text-gray-900 dark:text-white",
                                    children: "تفاصيل القطعة"
                                }, void 0, false, {
                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                    lineNumber: 371,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setDetailsModal(null),
                                    className: "text-gray-500 hover:text-red-500 font-bold text-xl transition-colors",
                                    children: "✕"
                                }, void 0, false, {
                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                    lineNumber: 372,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/PCBuilderClient.tsx",
                            lineNumber: 370,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-bold text-blue-600 dark:text-blue-400",
                                            children: detailsModal.comp.brand
                                        }, void 0, false, {
                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                            lineNumber: 376,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-2xl font-bold text-gray-900 dark:text-white mt-1",
                                            children: detailsModal.comp.name
                                        }, void 0, false, {
                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                            lineNumber: 377,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                    lineNumber: 375,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-4 mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-gray-50 dark:bg-slate-800 p-3 rounded-lg",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "block text-sm text-gray-500 dark:text-gray-400",
                                                    children: "السعر"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                                    lineNumber: 381,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-lg dark:text-white",
                                                    children: [
                                                        "$",
                                                        detailsModal.comp.price
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                                    lineNumber: 382,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                            lineNumber: 380,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-gray-50 dark:bg-slate-800 p-3 rounded-lg",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "block text-sm text-gray-500 dark:text-gray-400",
                                                    children: "استهلاك الطاقة"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                                    lineNumber: 385,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-lg dark:text-white",
                                                    children: [
                                                        detailsModal.comp.tdpWattage,
                                                        "W"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                                    lineNumber: 386,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                            lineNumber: 384,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                    lineNumber: 379,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "font-bold text-gray-900 dark:text-gray-200 border-b dark:border-slate-700 pb-2 mb-2",
                                            children: "المواصفات التقنية:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                            lineNumber: 390,
                                            columnNumber: 17
                                        }, this),
                                        renderSpecs(detailsModal.comp.specs)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                    lineNumber: 389,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "font-bold text-gray-900 dark:text-gray-200 border-b dark:border-slate-700 pb-2 mb-2",
                                            children: "وصف القطعة:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                            lineNumber: 394,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line",
                                            children: detailsModal.comp.description || "لا يوجد وصف متوفر لهذه القطعة."
                                        }, void 0, false, {
                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                            lineNumber: 395,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                    lineNumber: 393,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                handleSelect(detailsModal.categoryName, detailsModal.comp.id);
                                                setDetailsModal(null);
                                            },
                                            className: "flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors",
                                            children: "اختيار القطعة"
                                        }, void 0, false, {
                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                            lineNumber: 400,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setDetailsModal(null),
                                            className: "flex-1 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-white rounded-xl font-bold transition-colors",
                                            children: "إغلاق"
                                        }, void 0, false, {
                                            fileName: "[project]/components/PCBuilderClient.tsx",
                                            lineNumber: 401,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PCBuilderClient.tsx",
                                    lineNumber: 399,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/PCBuilderClient.tsx",
                            lineNumber: 374,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/PCBuilderClient.tsx",
                    lineNumber: 369,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/PCBuilderClient.tsx",
                lineNumber: 368,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/PCBuilderClient.tsx",
        lineNumber: 260,
        columnNumber: 5
    }, this);
}
_s1(PCBuilderClient, "E0dAQ79xVQZLCky/mKnRkFVFgJI=");
_c1 = PCBuilderClient;
var _c, _c1;
__turbopack_context__.k.register(_c, "SearchableSelect");
__turbopack_context__.k.register(_c1, "PCBuilderClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_PCBuilderClient_tsx_0v1kc42._.js.map