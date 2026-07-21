import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { HeartPulse, Users, GraduationCap, Star, Plus, X, Target, Calendar } from 'lucide-react';

export default function Programmes() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProgram, setNewProgram] = useState({ name: '', participants: '', status: 'Active' });

  const kpis = [
    { label: 'Bénéficiaires FM (Total)', value: '645', trend: '45% du total', icon: Star, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Taux de Complétion (%)', value: '92%', trend: '+3% vs global', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Participants NEET / Ruraux', value: '112', trend: '+15 nouveauté', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Score Global Impact', value: '8.8/10', trend: 'Objectif atteint', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const programs = [
    { id: '1', name: 'Women in AI', participants: 42, status: 'Active', progress: 65, color: 'accent-pink-500' },
    { id: '2', name: 'SuperCodeur', participants: 120, status: 'Completed', progress: 100, color: 'accent-orange-500' },
    { id: '3', name: 'Hello Future!', participants: 85, status: 'Pending', progress: 0, color: 'accent-blue-500' },
    { id: '4', name: 'Orange Digital Academy', participants: 25, status: 'Active', progress: 30, color: 'accent-emerald-500' }
  ];

  const handleCreate = (e) => {
    e.preventDefault();
    alert('Programme créé avec succès !');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Programmes Spéciaux" 
          description="Suivi des initiatives spécifiques : Inclusion, Mixité, et Impact Social."
          badge="Inclusion"
        />
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-odc-orange text-white rounded-2xl text-sm font-black shadow-lg shadow-orange-500/20 hover:bg-odc-black transition-all"
        >
          <Plus className="w-5 h-5" />
          Ajouter Programme
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl border-b-4 border-transparent hover:border-odc-orange transition-all">
            <div className={`p-3 w-fit rounded-xl mb-4 ${kpi.bg} ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{kpi.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-black">{kpi.value}</h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-8 rounded-[32px]">
        <h3 className="text-xl font-black mb-8 tracking-tight">Suivi des cohortes par programme</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {programs.map((prog, i) => (
              <div 
                key={i} 
                onClick={() => navigate(`/programmes/${prog.id}`)}
                className="p-6 rounded-[24px] bg-gray-50/50 border border-gray-100 hover:border-odc-orange/30 hover:bg-white hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-lg font-black group-hover:text-odc-orange transition-colors">{prog.name}</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">{prog.participants} participants inscrits</p>
                  </div>
                  <span className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-lg ${
                    prog.status === 'Active' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                    prog.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {prog.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                   <div className={`h-full bg-odc-orange rounded-full group-hover:animate-pulse`} style={{ width: `${prog.progress}%` }} />
                </div>
                <div className="flex justify-between items-center mt-3">
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Progression</span>
                   <span className="text-sm font-black text-odc-black">{prog.progress}%</span>
                </div>
              </div>
           ))}
        </div>
      </div>

      {/* Create Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-odc-black mb-8 flex items-center gap-3">
              <div className="p-2 bg-orange-50 text-odc-orange rounded-xl"><Target className="w-6 h-6" /></div>
              Nouveau Programme
            </h3>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Titre du Programme</label>
                <input 
                  type="text" required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm outline-none focus:border-odc-orange transition-all"
                  placeholder="Ex: Orange Summer Challenge..."
                  value={newProgram.name}
                  onChange={(e) => setNewProgram({...newProgram, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cible Participants</label>
                  <input 
                    type="number" required
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm outline-none focus:border-odc-orange transition-all"
                    placeholder="Ex: 100"
                    value={newProgram.participants}
                    onChange={(e) => setNewProgram({...newProgram, participants: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date de début</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="date" required
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-odc-orange transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-gray-200 transition-all">Annuler</button>
                <button type="submit" className="flex-2 px-8 py-4 bg-odc-orange text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-orange-500/20 hover:bg-odc-black transition-all">Créer le programme</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
