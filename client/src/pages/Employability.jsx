import React from 'react';
import PageHeader from '../components/PageHeader';
import { Briefcase, TrendingUp, Users, Target, Rocket, GraduationCap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';

export default function Employability() {
  const kpis = [
    { label: 'Taux d’Insertion Global', value: '60%', trend: 'Target ODC', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Placement JobInTech', value: '>75%', trend: 'Objectif Succès', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Stagiaires (PFE/PFA)', value: '1,300', trend: 'Cumulatif', icon: GraduationCap, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Certifications Coursera', value: '1,660', trend: '12,600h formation', icon: Rocket, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const chartData = [
    { name: 'Développement Web', value: 45, color: '#FF7900' },
    { name: 'Data & IA', value: 25, color: '#6366F1' },
    { name: 'Design / UX', value: 15, color: '#10B981' },
    { name: 'DevOps / Cloud', value: 15, color: '#EC4899' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <PageHeader 
        title="Employabilité & Insertion" 
        description="Mesure de l'impact réel des programmes de formation et de reconversion professionnelle."
        badge="Impact Social"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-all duration-300">
            <div className={`p-3 w-fit rounded-xl mb-4 ${kpi.bg} ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{kpi.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-odc-black">{kpi.value}</h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* JobInTech Section */}
        <div className="glass-card p-8 rounded-[32px] bg-gradient-to-br from-odc-black to-gray-800 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                <Target className="w-6 h-6 text-odc-orange" />
              </div>
              <div>
                <h3 className="text-xl font-bold">JobInTech (Reconversion)</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-odc-orange">Full Stack Bootcamp</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-3xl font-black">225</p>
                <p className="text-[10px] font-bold uppercase opacity-60">Apprenants Cible</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-3xl font-black">&gt;75%</p>
                <p className="text-[10px] font-bold uppercase opacity-60">Taux de placement</p>
              </div>
            </div>

            <p className="text-sm text-white/70 leading-relaxed">
              Programme intensif de 4 mois visant à former des profils opérationnels aux métiers du numérique, spécifiquement conçu pour les chercheurs d'emploi (NEET) souhaitant pivoter vers le développement Web, la Data ou l'IA.
            </p>
          </div>
          <Target className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 text-white pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Secteurs Recrutement */}
        <div className="glass-card p-8 rounded-[32px] bg-white border border-gray-100 flex flex-col">
          <h3 className="text-xl font-bold text-odc-black mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-odc-orange" />
            Répartition par Secteur (Placement)
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Coaching & Mentoring */}
      <div className="glass-card p-8 rounded-[32px] bg-orange-50 border border-orange-100 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="flex-1">
            <h3 className="text-2xl font-black text-odc-black mb-2">Coaching & Mentoring</h3>
            <p className="text-gray-600 text-sm max-w-xl">
              Accompagnement personnalisé pour les stagiaires et apprenants en reconversion. Plus de **50 sessions** organisées annuellement pour optimiser le Time-to-Impact et la réussite des entretiens.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-200 text-center min-w-[120px]">
              <p className="text-2xl font-black text-odc-orange">+50</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sessions / An</p>
            </div>
          </div>
        </div>
        <GraduationCap className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 text-odc-orange" />
      </div>
    </div>
  );
}
