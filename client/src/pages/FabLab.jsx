import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { 
  Microscope, 
  Hammer, 
  Users, 
  Lightbulb, 
  Wrench, 
  GraduationCap, 
  Clock, 
  Filter, 
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';

export default function FabLab() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState('2026');
  const isManager = user?.role === 'manager';

  const kpis = [
    { label: 'Projets Réalisés', value: '142', trend: '+18% vs 2025', icon: Lightbulb, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Master Réparateur', value: '12', trend: 'Sessions', icon: Wrench, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { 
      label: 'Participants (FabLab)', 
      value: '1,200', 
      trend: 'Total', 
      icon: Users, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50',
      gender: { women: '44%', men: '56%' }
    },
    { label: 'Employabilité (programme de reconverstion professionelle)', value: '60%', trend: 'Impact Direct', icon: Microscope, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const chartData = [
    { name: 'Jan', value: 145 },
    { name: 'Fév', value: 182 },
    { name: 'Mar', value: 210 },
    { name: 'Avr', value: 245 },
    { name: 'Mai', value: 258 },
    { name: 'Juin', value: 160 },
  ];

  const programData = [
    { name: 'Master Réparateur', value: 680, color: '#6366F1' },
    { name: 'Prototypage Industriel', value: 320, color: '#FF7900' },
    { name: 'Création Artistique', value: 120, color: '#10B981' },
    { name: 'Social Impact', value: 80, color: '#EC4899' },
  ];

  return (
    <div className="space-y-2 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="FabLab & Prototypage" 
          description="Espace d'innovation pour la fabrication numérique, le prototypage et l'impact social."
          badge="Innovation"
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
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-indigo-500">Hommes {kpi.gender.men}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isManager ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-[32px] border border-gray-100 bg-white shadow-sm overflow-hidden relative">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-odc-black flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-odc-orange" />
                Évolution de l'activité
              </h3>
              <p className="text-sm text-gray-500 mt-1">Nombre de participants formés par mois</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#FF7900" radius={[8, 8, 8, 8]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === chartData.length - 1 ? '#FF7900' : '#e2e8f0'} 
                        className="hover:fill-odc-orange transition-colors duration-300"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[32px] border border-gray-100 bg-white shadow-sm flex flex-col">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-odc-black flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-indigo-500" />
                Répartition par Programme
              </h3>
              <p className="text-sm text-gray-500 mt-1">Impact cumulé par type de formation</p>
            </div>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={programData}
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {programData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-10">
                <span className="text-3xl font-black text-odc-black">1,200</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Impact Total</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Master Réparateur Section */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-gray-100 bg-white">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold flex items-center gap-2">
                 <GraduationCap className="w-5 h-5 text-odc-orange" />
                 Formations Master Réparateur
               </h3>
               <button className="text-xs font-bold text-odc-orange hover:underline">Voir tout</button>
            </div>
            
            <div className="space-y-4">
              {[
                { title: 'Réparation Smartphone Niveau 1', date: '24 Avril 2026', participants: 15, duration: '20h' },
                { title: 'Diagnostic Électronique Avancé', date: '28 Avril 2026', participants: 12, duration: '15h' },
                { title: 'Soudure et Micro-soudure', date: '02 Mai 2026', participants: 8, duration: '25h' },
                { title: 'Maintenance Tablettes', date: '05 Mai 2026', participants: 10, duration: '12h' }
              ].map((formation, i) => (
                <div key={i} className="group p-4 rounded-xl border border-gray-50 hover:border-orange-100 hover:bg-orange-50/30 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900 group-hover:text-odc-orange transition-colors">{formation.title}</h4>
                    <span className="px-2 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500">
                      {formation.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formation.date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {formation.participants} participants
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reservations (Sidebar) */}
          <div className="glass-card p-6 rounded-2xl border border-gray-100 bg-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
               <Clock className="w-5 h-5 text-indigo-500" />
               Réservations récentes
            </h3>
            <div className="space-y-4">
               {[1, 2, 3, 4].map((res) => (
                  <div key={res} className="p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 group">
                     <h4 className="text-sm font-bold mb-1 group-hover:text-odc-orange transition-colors">Projet de validation #FAB{res}</h4>
                     <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Users className="w-3 h-3" /> Étudiant ODC | <Hammer className="w-3 h-3" /> Laser
                     </p>
                     <span className="text-[10px] text-gray-400 mt-2 block">Demain, 14:00 - 18:00</span>
                  </div>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

