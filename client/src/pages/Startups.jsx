import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { 
  Rocket, 
  Target, 
  Users, 
  DollarSign, 
  Filter, 
  BarChart3, 
  PieChart as PieChartIcon 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

export default function Startups() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState('2026');
  const isManager = user?.role === 'manager';

  const kpis = [
    { label: 'Startups Accompagnées', value: '410', trend: 'Cumulative', icon: Rocket, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Startups Accélérées', value: '70', trend: 'Accélération', icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { 
      label: 'Contrats Signés (BUs)', 
      value: '33', 
      trend: '+10 en cours', 
      icon: Users, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50'
    },
    { label: 'Startups Parité', value: '44%', trend: 'Femmes entrepreneurs', icon: Rocket, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const pieData = [
    { name: 'Idéation', value: 184, color: '#FF7900' },
    { name: 'MVP', value: 112, color: '#0EA5E9' },
    { name: 'Go-to-Market', value: 86, color: '#A855F7' },
    { name: 'Scale-up', value: 28, color: '#22C55E' },
  ];

  return (
    <div className="space-y-2 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Startups & Accélération" 
          description="Suivi de l'écosystème entrepreneurial, de l'idée au MVP et à la croissance."
          badge="Croissance"
        />
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <Filter className="w-4 h-4 text-gray-400 ml-2" />
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="text-sm font-bold bg-transparent outline-none pr-4"
          >
            <option value="2026">Année 2026</option>
            <option value="2025">Année 2025</option>
            <option value="all">Tout le temps</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 bg-white">
            <div className={`p-3 w-fit rounded-xl mb-4 ${kpi.bg} ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <p className="text-gray-500 text-sm font-medium">{kpi.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold">{kpi.value}</h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {kpi.trend}
              </span>
            </div>
            {kpi.gender && (
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-rose-500">Femmes {kpi.gender.women}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-blue-500">Hommes {kpi.gender.men}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Programmes Phares Section - MOVED TO TOP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
         <div className="glass-card p-8 rounded-[32px] bg-white border border-gray-100 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                     <Target className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-odc-black">POESAM 2025</h3>
                     <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em]">15ème Édition</p>
                  </div>
               </div>
               <div className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-tighter">En cours</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <p className="text-2xl font-black text-emerald-700">381</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Candidatures</p>
               </div>
               <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                  <p className="text-2xl font-black text-orange-700">+50%</p>
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Femmes</p>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Spécialités dominantes (2025)</p>
                  <div className="flex flex-wrap gap-2">
                     <span className="px-3 py-1 bg-white text-[10px] font-bold text-gray-500 rounded-lg border border-gray-100 shadow-sm">🌱 Agriculture</span>
                     <span className="px-3 py-1 bg-white text-[10px] font-bold text-gray-500 rounded-lg border border-gray-100 shadow-sm">🌍 Environnement</span>
                     <span className="px-3 py-1 bg-white text-[10px] font-bold text-gray-500 rounded-lg border border-gray-100 shadow-sm">🏥 Santé</span>
                  </div>
               </div>

               <div className="pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 text-center">Historique POESAM (Depuis 2017)</p>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="text-center">
                        <p className="text-lg font-black text-odc-black">+30</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Startups Accompagnées</p>
                     </div>
                     <div className="text-center">
                        <p className="text-lg font-black text-odc-black">2.2M</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">DHS de dotation</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="glass-card p-8 rounded-[32px] bg-white border border-gray-100 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-odc-orange shadow-inner">
                     <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-odc-black">Start&Scale</h3>
                     <p className="text-[10px] font-bold text-odc-orange uppercase tracking-[0.2em]">Accélération</p>
                  </div>
               </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
               Programme d'accompagnement dédié aux entrepreneurs et startups, combinant formation, mentorat et suivi individualisé pour soutenir la structuration, la croissance et le passage à l'échelle des projets innovants.
            </p>
            <div className="flex flex-wrap gap-2">
               <span className="px-3 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-full border border-gray-100 uppercase tracking-tighter">Workshops thématiques</span>
               <span className="px-3 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-full border border-gray-100 uppercase tracking-tighter">Sessions 1-to-1</span>
               <span className="px-3 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-full border border-gray-100 uppercase tracking-tighter">Accès Ecosystème</span>
            </div>
         </div>
      </div>

      {isManager ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
           <div className="glass-card p-6 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col items-center justify-center">
             <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-6 w-full flex items-center gap-2">
               <PieChartIcon className="w-4 h-4" /> Répartition du Portfolio
             </h3>
             <div className="h-64 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={pieData}
                     innerRadius={70}
                     outerRadius={90}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-odc-black">410</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Startups</span>
               </div>
             </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
          <div className="glass-card p-6 rounded-2xl bg-white border border-gray-100">
            <h3 className="text-lg font-bold mb-4">Dernières Activités Mentoring</h3>
            <div className="space-y-4">
               {[1, 2, 3, 4].map((act) => (
                  <div key={act} className="flex gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                     <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                     <div>
                        <h4 className="text-sm font-bold">Session Mentoring #RDV{act}</h4>
                        <p className="text-xs text-gray-500">Startup: BioTech Morocco | Mentor: Salim E.</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">Il y a 2 jours</span>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
