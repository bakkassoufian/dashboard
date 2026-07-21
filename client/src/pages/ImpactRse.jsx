import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import AiModal from '../components/AiModal';
import { 
  Heart, 
  Users, 
  GraduationCap, 
  Globe, 
  TrendingUp, 
  MapPin, 
  ShieldCheck, 
  Gamepad2,
  ShieldAlert,
  Mic2,
  School,
  Trophy,
  Target,
  BarChart3,
  Sparkles
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
  Cell, 
  PieChart, 
  Pie,
  Legend,
  CartesianGrid
} from 'recharts';
import { api } from '../api/client';

export default function ImpactRse() {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const [data, setData] = useState({
    totalParticipants: 0,
    womenPercent: 0,
    impactScore: 8.7,
    cyber: {
      tournee: {
        colleges: 1300,
        resources: 4380,
        studentsListening: 1060000,
      },
      talkshow: {
        editions: 2,
        participants: 1540,
        workshops: 24,
      },
      regionalData: [
        { region: 'Casablanca', colleges: 240, resources: 850 },
        { region: 'Rabat', colleges: 180, resources: 620 },
        { region: 'Agadir', colleges: 150, resources: 540 },
        { region: 'Tanger', colleges: 130, resources: 480 },
        { region: 'Marrakech', colleges: 120, resources: 410 },
      ]
    },
    superCodeurs: {
      teachers: 120,
      studentsInitiated: 5400,
      hackathons: 12,
      yearlyProgress: [
        { year: '2022', students: 1200, teachers: 45 },
        { year: '2023', students: 2800, teachers: 78 },
        { year: '2024', students: 4200, teachers: 102 },
        { year: '2025', students: 5400, teachers: 120 },
      ]
    }
  });

  const handleAiAnalysis = async () => {
    setIsAiModalOpen(true);
    setAiGenerating(true);
    try {
      const res = await api.post('/ai/dashboard-analysis', {
        stats: {
           totalParticipants: data.totalParticipants,
           womenBeneficiaries: Math.round(data.totalParticipants * (data.womenPercent / 100))
        },
        filters: {}
      });
      if (res.success) {
        setAiAnalysis(res.data.analysis);
      }
    } catch (err) {
      console.error("AI Analysis failed", err);
    } finally {
      setAiGenerating(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/global-stats');
        if (res.success) {
          setData(prev => ({
            ...prev,
            totalParticipants: res.data.totalParticipants,
            womenPercent: res.data.totalParticipants > 0 
              ? Math.round((res.data.womenBeneficiaries / res.data.totalParticipants) * 100) 
              : 0,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch RSE stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="pt-6 space-y-4 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <PageHeader 
          title="Impact & RSE" 
          description="Pilotage des engagements sociétaux : Cyberharcèlement et Super Codeurs."
          badge="Social Responsibility"
        />
        
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-3xl border border-white/20 shadow-sm">
          <button 
            onClick={handleAiAnalysis}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center gap-2 font-black text-[11px] uppercase tracking-widest"
          >
            <Sparkles className="w-4 h-4" />
            Analyse IA Impact
          </button>
          
          <div className="flex items-center gap-4 px-4 py-2 bg-white/80 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Score Impact</span>
            </div>
            <div className="text-2xl font-black text-odc-black">{data.impactScore}<span className="text-xs text-gray-400">/10</span></div>
          </div>
        </div>
      </div>

      {/* 1. Cyberharcèlement Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
           </div>
           <h2 className="text-2xl font-black tracking-tight text-odc-black">Cyberharcèlement</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Tournée régionale Cards */}
           <div className="lg:col-span-1 space-y-4">
              <div className="glass-card p-6 rounded-[24px] border-l-4 border-rose-500">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Collèges couverts</p>
                 <p className="text-3xl font-black text-odc-black">{data.cyber.tournee.colleges.toLocaleString()}</p>
              </div>
              <div className="glass-card p-6 rounded-[24px] border-l-4 border-rose-500">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ressources formées</p>
                 <p className="text-3xl font-black text-odc-black">{data.cyber.tournee.resources.toLocaleString()}</p>
              </div>
              <div className="glass-card p-6 rounded-[24px] border-l-4 border-rose-500">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Élèves (Accès cellules)</p>
                 <p className="text-3xl font-black text-odc-black">1.06M</p>
              </div>
           </div>

           {/* Regional Coverage Graph */}
           <div className="lg:col-span-2 glass-card p-8 rounded-[32px]">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                 <BarChart3 className="w-5 h-5 text-rose-500" />
                 Couverture par Région (Tournée)
              </h3>
              <div className="h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.cyber.regionalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }} />
                       <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                       <Bar dataKey="colleges" fill="#E11D48" radius={[4, 4, 0, 0]} name="Collèges" />
                       <Bar dataKey="resources" fill="#FB7185" radius={[4, 4, 0, 0]} name="Ressources" />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Talkshow Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="glass-card p-6 rounded-[24px] text-center">
              <Mic2 className="w-6 h-6 text-rose-500 mx-auto mb-3" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Talkshow Éditions</p>
              <p className="text-2xl font-black text-odc-black">{data.cyber.talkshow.editions}</p>
           </div>
           <div className="glass-card p-6 rounded-[24px] text-center">
              <Users className="w-6 h-6 text-rose-500 mx-auto mb-3" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Participants</p>
              <p className="text-2xl font-black text-odc-black">{data.cyber.talkshow.participants.toLocaleString()}</p>
           </div>
           <div className="glass-card p-6 rounded-[24px] text-center">
              <Target className="w-6 h-6 text-rose-500 mx-auto mb-3" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ateliers FGC</p>
              <p className="text-2xl font-black text-odc-black">{data.cyber.talkshow.workshops}</p>
           </div>
        </div>
      </section>

      {/* 2. Super Codeurs Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Gamepad2 className="w-6 h-6" />
           </div>
           <h2 className="text-2xl font-black tracking-tight text-odc-black">Super Codeurs</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Progression Graph */}
           <div className="glass-card p-8 rounded-[32px]">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-blue-500" />
                 Progression du Programme
              </h3>
              <div className="h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.superCodeurs.yearlyProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <defs>
                          <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }} />
                       <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                       <Area type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" name="Élèves initiés" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* SuperCodeurs Stats Cards */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-[28px] border-t-8 border-blue-500 flex flex-col justify-center">
                 <School className="w-8 h-8 text-blue-500 mb-4" />
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enseignants formés</p>
                 <p className="text-4xl font-black text-odc-black">{data.superCodeurs.teachers}</p>
              </div>
              <div className="glass-card p-6 rounded-[28px] border-t-8 border-blue-500 flex flex-col justify-center">
                 <Trophy className="w-8 h-8 text-blue-500 mb-4" />
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hackathons</p>
                 <p className="text-4xl font-black text-odc-black">{data.superCodeurs.hackathons}</p>
              </div>
              <div className="p-8 rounded-[28px] bg-blue-600 text-white col-span-full shadow-xl shadow-blue-500/20">
                 <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Total Élèves Initiés</p>
                    <Gamepad2 className="w-6 h-6 text-white/50" />
                 </div>
                 <p className="text-5xl font-black">{data.superCodeurs.studentsInitiated.toLocaleString()}</p>
                 <p className="text-xs font-bold mt-2 text-white/90">Impact à travers les 12 régions du Maroc</p>
              </div>
           </div>
        </div>
      </section>

      <AiModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
        generating={aiGenerating}
        analysis={aiAnalysis}
      />
    </div>
  );
}
