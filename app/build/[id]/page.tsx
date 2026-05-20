import { prisma } from '../../../lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function SharedBuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const build = await prisma.savedBuild.findUnique({
    where: { id }
  });

  if (!build) return notFound();

  const componentIds = [build.cpuId, build.gpuId, build.ramId, build.motherboardId, build.caseId, build.psuId, build.storageId].filter(Boolean) as string[];

  const components = await prisma.component.findMany({
    where: { id: { in: componentIds } },
    select: { id: true, name: true, brand: true, price: true, imageUrl: true, amazonUrl: true, cazasouqUrl: true }
  });

  const compMap = new Map(components.map(c => [c.id, c]));

  const parts = {
    CPU: build.cpuId ? compMap.get(build.cpuId) : null,
    GPU: build.gpuId ? compMap.get(build.gpuId) : null,
    RAM: build.ramId ? compMap.get(build.ramId) : null,
    Motherboard: build.motherboardId ? compMap.get(build.motherboardId) : null,
    Case: build.caseId ? compMap.get(build.caseId) : null,
    PSU: build.psuId ? compMap.get(build.psuId) : null,
    Storage: build.storageId ? compMap.get(build.storageId) : null,
  };

  const totalPrice = Object.values(parts).reduce((sum, part) => sum + (part?.price || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-[80vh]">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="bg-blue-900 dark:bg-slate-800 p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{build.name}</h1>
            <p className="text-blue-200 dark:text-gray-400 text-sm mt-1">
              تم الإنشاء في: {new Date(build.createdAt).toLocaleDateString('ar-SA')}
            </p>
          </div>
          <div className="text-xl font-bold bg-blue-800 dark:bg-slate-700 px-4 py-2 rounded-lg">
            ${totalPrice}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(parts).map(([category, part]: [string, any]) => (
              <div key={category} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700 gap-4">
                <div className="flex items-center gap-4">
                  {part?.imageUrl && (
                    <img src={part.imageUrl} alt={part.name} className="w-16 h-16 rounded object-contain bg-white dark:bg-slate-700 p-1 shadow-sm" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-gray-500 block mb-1">[{category}]</span>
                    <span className="text-gray-900 dark:text-gray-100 font-bold text-lg">
                      {part ? `${part.brand} ${part.name}` : <span className="text-red-500">لم يتم اختيار قطعة</span>}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {part && <span className="font-bold text-green-600 dark:text-green-400">${part.price}</span>}
                  
                  {part && (part.amazonUrl || part.cazasouqUrl) && (
                    <div className="flex gap-2">
                      {part.amazonUrl && (
                        <a href={part.amazonUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded font-bold transition-colors">
                          أمازون
                        </a>
                      )}
                      {part.cazasouqUrl && (
                        <a href={part.cazasouqUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded font-bold transition-colors">
                          كازاسوق
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center border-t border-gray-200 dark:border-slate-700 pt-6">
            <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
              ابني تجميعتك الخاصة ⚡
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}