import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Users, Calendar, Filter, Presentation, Target, Microscope, Rocket } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PageHeader from '../components/PageHeader';

function CountUp({ end, duration = 1500, suffix = '' }) {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);

  useEffect(() => {
    let animationFrameId;
    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

const DATA_EDC = {
  entityName: "École du Code",
  icon: GraduationCap,
  totalParticipants: 350,
  /** Part des femmes parmi les bénéficiaires (0–100) ; hommes = complément */
  womenPercent: 60,
  totalFormations: 8,
  stagiairesEncadres: 24,
  totalProjects: 15,
  monthlyActivity: [
    { month: 'Jan', participants: 40 },
    { month: 'Fév', participants: 65 },
    { month: 'Mar', participants: 85 },
    { month: 'Avr', participants: 45 },
    { month: 'Mai', participants: 90 },
    { month: 'Juin', participants: 25 },
  ],
  activityType: [
    { name: 'Bootcamps', value: 200, color: '#FF7900' },
    { name: 'Ateliers', value: 100, color: '#000000' },
    { name: 'Stages', value: 50, color: '#CCCCCC' },
  ]
};

const DATA_FABLAB = {
  entityName: "FabLab Solidaire",
  icon: Microscope,
  totalParticipants: 90,
  womenPercent: 55,
  totalFormations: 2,
  stagiairesEncadres: 5,
  totalProjects: 32, // Projets de prototypage
  monthlyActivity: [
    { month: 'Jan', participants: 10 },
    { month: 'Fév', participants: 15 },
    { month: 'Mar', participants: 25 },
    { month: 'Avr', participants: 15 },
    { month: 'Mai', participants: 5 },
    { month: 'Juin', participants: 20 },
  ],
  activityType: [
    { name: 'Ateliers Techniques', value: 60, color: '#000000' },
    { name: 'Accompagnement Projets', value: 30, color: '#FF7900' },
  ]
};

const DATA_ORANGEFAB = {
  entityName: "Orange Fab",
  icon: Rocket,
  totalParticipants: 45,
  womenPercent: 48,
  totalFormations: 4, // Séances de pitch/mentoring
  stagiairesEncadres: 0,
  totalProjects: 12, // Startups accompagnées
  monthlyActivity: [
    { month: 'Jan', participants: 5 },
    { month: 'Fév', participants: 10 },
    { month: 'Mar', participants: 5 },
    { month: 'Avr', participants: 10 },
    { month: 'Mai', participants: 5 },
    { month: 'Juin', participants: 10 },
  ],
  activityType: [
    { name: 'Mentoring', value: 30, color: '#FF7900' },
    { name: 'Pitch Sessions', value: 15, color: '#000000' },
  ]
};

export default function MemberDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    year: '2026',
    programme: ''
  });

  useEffect(() => {
    setData(null);
    const t = setTimeout(() => {
      const email = user?.email || '';
      const isFablab = email.includes('fablab');
      const isOrangeFab = email.includes('orangefab');
      
      const roleData = isFablab ? DATA_FABLAB : isOrangeFab ? DATA_ORANGEFAB : DATA_EDC;
      setData(roleData);
    }, 400);
    return () => clearTimeout(t);
  }, [filters, user]);

  if (!data) return <div className="p-12 text-center uppercase tracking-widest text-sm font-bold text-odc-orange animate-pulse">Analyse de vos activités...</div>;

  const EntityIcon = data.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-white/40 shadow-sm border border-white/20 rounded-2xl hidden md:block">
             <EntityIcon className="w-8 h-8 text-odc-orange" />
          </div>
          <PageHeader 
            title={data.entityName}
            description={`Bienvenue ${user?.firstName || ''}. Voici le résumé de l'impact et de l'activité limités à votre propre entité.`}
          />
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-2 bg-white/40 backdrop-blur-md rounded-[24px] border border-white/20 shadow-sm">
           <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select 
                value={filters.year} 
                onChange={(e) => setFilters(f => ({...f, year: e.target.value}))}
                className="bg-transparent border-none text-xs font-bold focus:ring-0 outline-none"
              >
                 <option value="2025">2025</option>
                 <option value="2026">2026</option>
              </select>
           </div>
           <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={filters.programme} 
                onChange={(e) => setFilters(f => ({...f, programme: e.target.value}))}
                className="bg-transparent border-none text-xs font-bold focus:ring-0 outline-none min-w-[150px]"
              >
                 <option value="">Tous les formats</option>
                 <option value="bootcamp">Bootcamps Intensifs</option>
                 <option value="atelier">Ateliers & Workshops</option>
                 <option value="stage">Encadrement Projet</option>
              </select>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bénéficiaires"
          val={data.totalParticipants}
          icon={Users}
          color="orange"
          trend="+12"
          womenPercent={typeof data.womenPercent === 'number' ? data.womenPercent : undefined}
        />
        <StatCard title="Sessions Formations" val={data.totalFormations} icon={Presentation} color="black" trend="+1" />
        <StatCard title={data.entityName === 'Orange Fab' ? "Startups Incubées" : "Stagiaires Encadrés"} val={data.stagiairesEncadres || data.totalProjects} icon={data.entityName === 'Orange Fab' ? Target : GraduationCap} color="black" trend={data.entityName === 'Orange Fab' ? undefined : "+2"} />
        <StatCard title="Projets réalisés" val={data.totalProjects} icon={Target} color="orange" trend="+1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Bar Chart */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[32px]">
          <div className="mb-6">
             <h3 className="text-xl font-black tracking-tight">Activité d'Encadrement de l'Entité</h3>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Évolution mensuelle des bénéficiaires</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlyActivity || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888', fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888', fontWeight: 'bold' }} />
                <Tooltip 
                   cursor={{ fill: '#f9fafb' }}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                />
                <Bar dataKey="participants" fill="#FF7900" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="glass-card p-8 rounded-[32px]">
          <div className="mb-6">
             <h3 className="text-xl font-black tracking-tight">Répartition</h3>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Par format d'activité</p>
          </div>
          <div className="h-[280px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                 data={data?.activityType || []} 
                 innerRadius={60} 
                 outerRadius={90} 
                 paddingAngle={5} 
                 dataKey="value"
                 stroke="none"
                >
                  {(data?.activityType || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-8">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total</span>
              <span className="text-2xl font-black text-odc-orange">{data.totalParticipants}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4">
               {(data?.activityType || []).map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                     <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] font-bold text-gray-600 truncate max-w-[80px]">{item.name}</span>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, val, icon: Icon, color, trend, womenPercent }) {
  const isOrange = color === 'orange';
  const menPct = typeof womenPercent === 'number' ? Math.max(0, 100 - Math.round(womenPercent)) : null;
  const womenPct = typeof womenPercent === 'number' ? Math.round(womenPercent) : null;
  return (
    <div className={`glass-card p-6 rounded-[24px] relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] border-b-[6px] ${isOrange ? 'border-odc-orange' : 'border-black'}`}>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-[16px] shadow-sm ${isOrange ? 'bg-orange-50 text-odc-orange' : 'bg-gray-100 text-black'}`}>
           <Icon className="w-5 h-5" />
        </div>
        {trend && (
           <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
             {trend}
           </span>
        )}
      </div>
      <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.1em] mb-1 relative z-10">{title}</p>
      <h3 className="text-3xl font-black relative z-10 tracking-tighter">
        <CountUp end={parseFloat(val)} />
      </h3>
      {womenPct != null && menPct != null && (
        <div className="relative z-10 mt-3 pt-3 border-t border-gray-200/80 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px]">
          <span className="text-gray-500">
            <span className="font-bold uppercase text-[9px] tracking-wider text-odc-orange">Femmes</span>{' '}
            <span className="font-black text-odc-black">{womenPct}%</span>
          </span>
          <span className="text-gray-500">
            <span className="font-bold uppercase text-[9px] tracking-wider text-gray-400">Hommes</span>{' '}
            <span className="font-black text-odc-black">{menPct}%</span>
          </span>
        </div>
      )}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 pointer-events-none ${isOrange ? 'text-odc-orange' : 'text-black'}`}>
         <Icon className="w-full h-full" />
      </div>
    </div>
  );
}
