import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MemberDashboard from './MemberDashboard';
import { api } from '../api/client';
import { 
  Users, 
  Rocket, 
  Briefcase, 
  MapPin, 
  Filter,
  Calendar,
  Trophy,
  Activity,
  Download,
  Sparkles,
  X,
  BrainCircuit,
  GraduationCap,
  TrendingUp,
  Gamepad2,
  ShieldCheck,
  Handshake,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import AiModal from '../components/AiModal';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  Legend
} from 'recharts';
import { STATIC_STATS } from '../data/staticStats';

function CountUp({ end, duration = 1500, suffix = '', prefix = '' }) {
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

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// CHIFFRES À JOUR (Pour les Analyses & Graphiques)
// Source : tableau de suivi ODC Maroc. Total = somme exacte du detail.
// NB : ne jamais ecrire les milliers avec un point (21.798 vaut 21,798 en JS).
const DATA_A_JOUR = {
  total: 39274,
  years: [
    { year: '2021', participants: 1727, women: 850, men: 877 },
    { year: '2022', participants: 8278, women: 4165, men: 4113 },
    { year: '2023', participants: 4701, women: 1978, men: 2723 },
    { year: '2024', participants: 6152, women: 2417, men: 3735 },
    { year: '2025', participants: 11242, women: 4619, men: 6623 },
    { year: 'S1 2026', participants: 7174, women: 3447, men: 3727 },
  ],
  totalWomen: 17476,
  totalMen: 21798,
};

const PCT_WOMEN = Math.round((DATA_A_JOUR.totalWomen / DATA_A_JOUR.total) * 100);
const PCT_MEN = Math.round((DATA_A_JOUR.totalMen / DATA_A_JOUR.total) * 100);

// CHIFFRES GLOBAUX (Pour le Hero / Overview par defaut)
const GLOBAL_STATS = {
  total: 198544,
  odc: DATA_A_JOUR.total,
  fab: 410,
  supercodeurs: 154500,
  cyber: 4300,
  partners: 60
};

const EMPTY_DASHBOARD = {
  totalParticipants: GLOBAL_STATS.total,
  womenBeneficiaries: DATA_A_JOUR.totalWomen, // 17 476
  totalTrainings: 775,
  totalStartups: 410,
  insertionRate: 60,
  childrenSuperCodeur: 154500,
  monthlyTrend: [],
  genderDist: [
    { name: 'Femmes', count: Math.round((DATA_A_JOUR.totalWomen / DATA_A_JOUR.total) * 100), color: '#FF7900' },
    { name: 'Hommes', count: Math.round((DATA_A_JOUR.totalMen / DATA_A_JOUR.total) * 100), color: '#000000' }
  ],
  breakdownByEntityCenter: [],
  startupsByScope: [],
  jobReadyCount: 0,
  uniqueTrainersCount: 0,
  participantsByYear: DATA_A_JOUR.years,
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  
  const [aiAnalysis, setAiAnalysis] = useState(null);
  
  const handleAiAnalysis = async () => {
    setIsAiModalOpen(true);
    setAiGenerating(true);
    try {
      const res = await api.post('/ai/dashboard-analysis', {
        stats: data,
        filters: filters
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

  const [filters, setFilters] = useState({
    year: '',
    ville: '',
    entity: '',
    activity: ''
  });

  useEffect(() => {
    setData(null);
    const loadData = async () => {
      try {
        const params = new URLSearchParams();
        params.append('year', filters.year);
        params.append('location', filters.ville);
        params.append('activity', filters.activity);
        
        const res = await api.get(`/analytics/global-stats?${params.toString()}`);
        
        let displayData = { ...EMPTY_DASHBOARD };
        
        if (res.success && res.data) {
           displayData = { ...displayData, ...res.data };
        }

        // Filter using STATIC_STATS
        if (!filters.year && !filters.ville && !filters.entity && !filters.activity) {
          displayData.totalParticipants = GLOBAL_STATS.total;
        } else {
          let relevantStats = STATIC_STATS.filter(s => {
             if (filters.year && String(s.year) !== filters.year) return false;
             if (filters.ville && s.ville && s.ville.toLowerCase() !== filters.ville.toLowerCase()) return false;
             if (filters.entity && s.type && s.type.toLowerCase() !== filters.entity.toLowerCase()) return false;
             return true;
          });
          
          let totalP = 0;
          let totalW = 0;
          relevantStats.forEach(s => {
             totalP += s.total;
             totalW += s.f;
          });
          
          displayData.totalParticipants = totalP;
          displayData.womenBeneficiaries = totalW;
        }

        setData(displayData);
      } catch (err) {
        setData(EMPTY_DASHBOARD);
      }
    };
    loadData();
  }, [filters]);

  if (user?.role === 'super_admin') return <Navigate to="/users" replace />;
  if (user?.role === 'member') return <MemberDashboard />;

  if (!data) return <div className="flex items-center justify-center min-h-[400px] text-odc-orange font-bold uppercase tracking-widest animate-pulse">Analysing ODC Ecosystem...</div>;

  const hasFilters = Boolean(filters.year || filters.ville || filters.activity);

  return (
    <div className="pt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 relative">
      {/* ODC Map Background Overlay */}
      <div className="fixed top-0 right-0 w-[800px] h-full pointer-events-none opacity-[0.04] z-0 grayscale select-none overflow-hidden translate-x-20">
         <img src="/assets/odc-map-bg.png" alt="" className="w-full h-full object-contain" />
      </div>

      {/* Header & Filters */}
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <PageHeader 
          title="Vue Exécutive"
          description="Pilotage stratégique de l'écosystème Orange Digital Center Maroc."
        />
        
        <div className="flex flex-wrap items-center gap-3 p-2 bg-white/40 backdrop-blur-md rounded-[24px] border border-white/20 shadow-sm">
           <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select value={filters.year} onChange={(e) => setFilters(f => ({...f, year: e.target.value}))} className="bg-transparent border-none text-xs font-bold focus:ring-0 outline-none">
                 <option value="">Année</option>
                 {['2021','2022','2023','2024','2025','2026'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
           </div>
           <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <MapPin className="w-4 h-4 text-gray-400" />
              <select value={filters.ville} onChange={(e) => setFilters(f => ({...f, ville: e.target.value}))} className="bg-transparent border-none text-xs font-bold focus:ring-0 outline-none w-32">
                 <option value="">Toutes les villes</option>
                 <option value="Casablanca">Casablanca</option>
                 <option value="Rabat">Rabat</option>
                 <option value="Agadir">Agadir</option>
              </select>
           </div>
           <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <select value={filters.entity} onChange={(e) => setFilters(f => ({...f, entity: e.target.value}))} className="bg-transparent border-none text-xs font-bold focus:ring-0 outline-none w-32">
                 <option value="">Toutes les entités</option>
                 <option value="edc">École du Code</option>
                 <option value="fablab">FabLab Solidaire</option>
                 <option value="super codeur">Super Codeur</option>
                 <option value="stage">Stage / PFE</option>
                 <option value="evenement">Événement</option>
              </select>
           </div>
           <button onClick={() => setFilters({year: '', ville: '', entity: '', activity: ''})} className="p-2.5 bg-odc-black text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-black/10 flex items-center justify-center min-w-[40px]">
              <Filter className="w-4 h-4" />
           </button>
           <button onClick={handleAiAnalysis} className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center gap-2 font-bold text-[11px] uppercase tracking-wider ml-2">
              <Sparkles className="w-4 h-4" />
              <span>Analyse IA</span>
           </button>
        </div>
      </div>

      {/* HERO SECTION - ALWAYS SHOWS GLOBAL FIGURES BY DEFAULT */}
      <div className="relative">
        <div className="bg-odc-orange rounded-[40px] pt-14 pb-10 px-8 text-center text-white shadow-2xl shadow-orange-500/20 max-w-4xl mx-auto relative z-10">
           <h2 className="text-7xl font-black tracking-tighter mb-1 leading-tight">
              <CountUp end={!hasFilters ? GLOBAL_STATS.total : data.totalParticipants} />
           </h2>
           <p className="text-xl font-bold uppercase tracking-widest opacity-90">
             {!hasFilters ? "Bénéficiaires à travers le Royaume" : `Bénéficiaires (${filters.year || 'Filtrés'})`}
           </p>
        </div>

        {/* Floating Sub-cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-[-40px] px-4 relative z-20">
           {/* Le bandeau affiche le cumul (39 274) : cette carte montre la periode
               en cours (S1 2026) pour ne pas repeter le meme chiffre. */}
           <HeroSubCard
             label="#OrangeDigitalCenter"
             icon={GraduationCap}
             mainValue={!hasFilters ? GLOBAL_STATS.odc : data.totalParticipants}
             mainPrefix={!hasFilters ? "+" : ""}
             mainLabel="bénéficiaires"
             details={[
               !hasFilters
                 ? `dont ${PCT_WOMEN}% de femmes`
                 : `dont ${Math.round((data.womenBeneficiaries / (data.totalParticipants || 1)) * 100)}% de femmes`,
               "+775 formations déployées",
               "+60% taux d'employabilité"
             ]}
           />
           <HeroSubCard label="#OrangeFab" icon={Rocket} mainValue={GLOBAL_STATS.fab} mainPrefix="+" mainLabel="Startups accompagnées" />
           <HeroSubCard label="#SuperCodeurs" icon={Gamepad2} mainValue={GLOBAL_STATS.supercodeurs} mainPrefix="+" mainLabel="enfants initiés au coding" details={["+4200 enseignants formés"]} />
           <HeroSubCard label="#Cyberconfiance" icon={ShieldCheck} mainValue={GLOBAL_STATS.cyber} mainPrefix="+" mainLabel="enseignants formés" subLabel="#ForGoodConnections" details={["+3900 élèves ambassadeurs"]} />
           <HeroSubCard label="Partenariats" icon={Handshake} mainValue={GLOBAL_STATS.partners} mainPrefix="+" mainLabel="partenaires nationaux et internationaux" />
        </div>
      </div>

      {/* Secondary Metrics & Charts - ALWAYS USE DATA_A_JOUR */}
      <div className="pt-4 space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-2xl font-black text-odc-black">Analyses Détaillées</h3>
           <div className="flex gap-2">
              <Link to="/rse" className="text-xs font-black text-odc-orange uppercase tracking-widest hover:underline flex items-center gap-1">
                 Voir Impact RSE <TrendingUp className="w-4 h-4" />
              </Link>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartCard title="Progression Annuelle" subtitle="Volume de bénéficiaires par année">
               <ResponsiveContainer width="100%" height={300}>
                 <BarChart data={DATA_A_JOUR.years} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888', fontWeight: 'bold' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888', fontWeight: 'bold' }} />
                   <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                   <Bar dataKey="participants" fill="#FF7900" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Parité (Cumulative)" subtitle="Répartition Femmes / Hommes">
               <ResponsiveContainer width="100%" height={300}>
                 <PieChart>
                    <Pie 
                      data={[
                        { name: 'Femmes', value: PCT_WOMEN },
                        { name: 'Hommes', value: PCT_MEN }
                      ]} 
                      innerRadius={80} 
                      outerRadius={110} 
                      paddingAngle={5} 
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#FF7900" />
                      <Cell fill="#000000" />
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" iconType="circle" />
                 </PieChart>
               </ResponsiveContainer>
            </ChartCard>
        </div>

        {filters.year ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartCard title="Évolution Mensuelle" subtitle={`Bénéficiaires en ${filters.year}`}>
               <ResponsiveContainer width="100%" height={300}>
                 <AreaChart data={data?.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#FF7900" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#FF7900" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888', fontWeight: 'bold' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888', fontWeight: 'bold' }} />
                   <Tooltip cursor={{ stroke: '#FF7900', strokeWidth: 1 }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                   <Area type="monotone" dataKey="val" stroke="#FF7900" strokeWidth={3} fill="url(#colorVal)" />
                 </AreaChart>
               </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Répartition par Centre" subtitle="Volume par ville & entité">
               <ResponsiveContainer width="100%" height={300}>
                 <BarChart data={data?.breakdownByEntityCenter || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888', fontWeight: 'bold' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888', fontWeight: 'bold' }} />
                   <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                   <Bar dataKey="Ecole du Code" stackId="a" fill="#FF7900" radius={[0, 0, 4, 4]} />
                   <Bar dataKey="FabLab Solidaire" stackId="a" fill="#000000" />
                   <Bar dataKey="Orange Fab" stackId="a" fill="#22C55E" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            </ChartCard>
          </div>
        ) : null}

      </div>

      <AiModal 
          isOpen={isAiModalOpen} 
          onClose={() => setIsAiModalOpen(false)} 
          generating={aiGenerating}
          analysis={aiAnalysis}
      />
    </div>
  );
}

function HeroSubCard({ label, icon: Icon, mainValue, mainPrefix = '', mainLabel, subLabel, details = [] }) {
  return (
    <div className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-50 transition-transform hover:-translate-y-2 duration-300">
       <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-orange-50 text-odc-orange rounded-lg">
             <Icon className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
       </div>
       <div className="mb-4 min-h-[60px]">
          <h4 className="text-2xl font-black text-odc-orange leading-none">
             <CountUp end={mainValue} prefix={mainPrefix} />
          </h4>
          <p className="text-xs font-bold text-gray-900 mt-1">{mainLabel}</p>
          {subLabel && <p className="text-[10px] text-gray-400 font-bold">{subLabel}</p>}
       </div>
       {details.length > 0 && (
          <div className="space-y-1 pt-4 border-t border-gray-50">
             {details.map((d, i) => (
                <p key={i} className="text-[10px] font-medium text-gray-500">{d}</p>
             ))}
          </div>
       )}
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="glass-card p-8 rounded-[32px]">
      <div className="mb-6">
         <h3 className="text-xl font-black tracking-tight">{title}</h3>
         <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

