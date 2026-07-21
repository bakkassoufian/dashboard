import React from 'react';
import { X, BrainCircuit, Sparkles } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function AiModal({ isOpen, onClose, generating, analysis }) {
  if (!isOpen) return null;

  const formatLine = (line) => {
    // Remove all markdown characters including hashtags
    let cleanLine = line.replace(/[#*]/g, '').trim();
    if (!cleanLine) return null;

    if (line.includes('###')) {
      return (
        <div className="flex items-center gap-2 mt-8 mb-4">
          <div className="w-1 h-6 bg-odc-orange rounded-full" />
          <h3 className="text-xl font-black text-odc-black tracking-tight uppercase">{cleanLine}</h3>
        </div>
      );
    }
    if (line.includes('####')) {
      return (
        <h4 className="text-md font-bold text-indigo-600 mt-6 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {cleanLine}
        </h4>
      );
    }
    if (line.startsWith('*') || line.startsWith('1.') || line.startsWith('-')) {
      return (
        <div className="flex gap-3 mb-3 pl-2">
          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-odc-orange shrink-0" />
          <p className="text-sm text-gray-600 leading-relaxed">{cleanLine}</p>
        </div>
      );
    }
    
    return <p className="text-sm text-gray-600 leading-relaxed mb-4">{cleanLine}</p>;
  };

  const projectionData = [
    { year: '2023', val: 120000 },
    { year: '2024', val: 156000 },
    { year: '2025', val: 198000 },
    { year: '2026 (Est)', val: 235000 },
    { year: '2027 (Est)', val: 278000 },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white max-w-2xl w-full rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh] scale-in-center">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-odc-orange to-orange-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-black text-2xl text-odc-black tracking-tighter">Analyse d'Impact IA</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">DeepSeek v3 Active Intelligence</p>
                </div>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 transition-colors"><X className="w-6 h-6" /></button>
        </div>
        
        <div className="p-10 overflow-y-auto custom-scrollbar">
           {generating ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                 <div className="relative">
                   <div className="w-20 h-20 border-4 border-orange-100 border-t-odc-orange rounded-full animate-spin" />
                   <BrainCircuit className="w-8 h-8 text-odc-orange absolute inset-0 m-auto" />
                 </div>
                 <div className="text-center">
                   <p className="text-lg font-black text-odc-black">Génération de l'analyse d'impact...</p>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Calcul des retours sociétaux</p>
                 </div>
              </div>
           ) : (
              <div className="space-y-1">
                 {analysis ? (
                   <>
                     <div className="mb-8 p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Projection de l'Inclusion Numérique (Volume)</p>
                        <div className="h-48 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={projectionData}>
                                 <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                 <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
                                 <Bar dataKey="val" fill="#FF7900" radius={[6, 6, 0, 0]} />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                     {analysis.split('\n').map((line, i) => <React.Fragment key={i}>{formatLine(line)}</React.Fragment>)}
                   </>
                 ) : (
                   <div className="py-20 text-center">
                     <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Aucune donnée disponible</p>
                   </div>
                 )}
              </div>
           )}
        </div>
        
        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">© 2026 Orange Social Responsibility AI</p>
           <button onClick={onClose} className="px-8 py-3 bg-odc-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-black/10 hover:scale-105 active:scale-95">
             Fermer l'analyse
           </button>
        </div>
      </div>
    </div>
  );
}
