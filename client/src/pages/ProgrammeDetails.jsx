import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { 
  ArrowLeft, 
  Users, 
  Target, 
  Calendar, 
  Trophy, 
  TrendingUp,
  CheckCircle2,
  Clock,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar,
  Cell
} from 'recharts';

const MOCK_DATA = {
  '1': {
    name: 'Women in AI',
    description: 'Programme d\'accompagnement intensif pour les femmes souhaitant se spécialiser dans l\'intelligence artificielle et le machine learning.',
    status: 'Active',
    progress: 65,
    participants: 42,
    beneficiaries: 120, // Total targeted
    completionRate: 85,
    startDate: '15 Janvier 2026',
    endDate: '30 Juin 2026',
    stats: [
      { name: 'Jan', val: 10 },
      { name: 'Fév', val: 25 },
      { name: 'Mar', val: 42 },
      { name: 'Avr', val: 42 },
    ]
  }
};

export default function ProgrammeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // For demo, if ID doesn't exist, we use a default
  const data = MOCK_DATA[id] || MOCK_DATA['1'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-odc-orange transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Retour aux programmes
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <PageHeader 
          title={data.name}
          description={data.description}
          badge={data.status}
        />
        <div className="flex gap-3">
          <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold border border-emerald-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            En cours de réalisation
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Participants Actuels" value={data.participants} icon={Users} color="orange" />
        <MetricCard label="Taux de Complétion" value={`${data.completionRate}%`} icon={Trophy} color="black" />
        <MetricCard label="Progression Cohorte" value={`${data.progress}%`} icon={TrendingUp} color="black" />
        <MetricCard label="Impact Estimé" value="4.8/5" icon={PieChartIcon} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 rounded-[32px]">
           <div className="mb-6 flex justify-between items-center">
             <div>
               <h3 className="text-xl font-black tracking-tight">Évolution des inscriptions</h3>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Nombre cumulé de participantes</p>
             </div>
           </div>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data.stats}>
                 <defs>
                   <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#FF7900" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#FF7900" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                 <Tooltip />
                 <Area type="monotone" dataKey="val" stroke="#FF7900" strokeWidth={3} fill="url(#colorVal)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-card p-8 rounded-[32px] flex flex-col gap-6">
           <h3 className="text-xl font-black tracking-tight">Informations clés</h3>
           <div className="space-y-4">
              <InfoRow icon={Calendar} label="Date de début" value={data.startDate} />
              <InfoRow icon={Clock} label="Date de fin" value={data.endDate} />
              <InfoRow icon={Target} label="Objectif" value={`${data.beneficiaries} bénéficiaires`} />
           </div>
           <div className="mt-auto pt-6 border-t border-gray-100">
              <button className="w-full py-4 bg-odc-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10">
                Gérer les participantes
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }) {
  const isOrange = color === 'orange';
  return (
    <div className={`glass-card p-6 rounded-[24px] border-b-4 ${isOrange ? 'border-odc-orange' : 'border-black'}`}>
       <div className={`p-3 w-fit rounded-xl mb-4 ${isOrange ? 'bg-orange-50 text-odc-orange' : 'bg-gray-100 text-black'}`}>
         <Icon className="w-5 h-5" />
       </div>
       <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
       <h4 className="text-3xl font-black mt-1 tracking-tighter">{value}</h4>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
       <div className="p-2 bg-white rounded-lg text-odc-orange shadow-sm">
         <Icon className="w-4 h-4" />
       </div>
       <div>
         <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</p>
         <p className="text-sm font-bold text-gray-900">{value}</p>
       </div>
    </div>
  );
}
