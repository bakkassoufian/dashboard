import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { Plus, FileUp, X } from 'lucide-react';

function CountUp({ end, duration = 1500 }) {
  const [count, setCount] = React.useState(0);
  const startTime = React.useRef(null);

  React.useEffect(() => {
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

  return <span>{count}</span>;
}

export default function Participants() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ firstName: '', lastName: '', email: '', phone: '', specialty: '' });
  const [data, setData] = useState([]);
  const [formations, setFormations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', specialty: '', educationLevel: '', formationId: '', recommendedForJobDating: '' });

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    try {
      await api.post('/participants', newParticipant);
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/participants?${params}`)
      .then((res) => {
        setData(res.data || []);
        setTotal(res.total ?? 0);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/formations?limit=200').then((r) => setFormations(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Bénéficiaires" 
          description="Base de données unifiée des apprenants et participants aux programmes ODC."
        />
        {(user?.role === 'super_admin' || (user?.role === 'member' && user?.entityId?.type === 'FabLab Solidaire')) && (
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/import')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
            >
              <FileUp className="w-4 h-4" />
              Importer
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-odc-orange text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:bg-odc-black transition-all"
            >
              <Plus className="w-4 h-4" />
              Ajouter participant
            </button>
          </div>
        )}
      </div>

      {/* Add Participant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-odc-black mb-6">Nouveau Participant</h3>
            <form onSubmit={handleAddParticipant} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Prénom</label>
                  <input type="text" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all" value={newParticipant.firstName} onChange={(e) => setNewParticipant({...newParticipant, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nom</label>
                  <input type="text" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all" value={newParticipant.lastName} onChange={(e) => setNewParticipant({...newParticipant, lastName: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
                <input type="email" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all" value={newParticipant.email} onChange={(e) => setNewParticipant({...newParticipant, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Spécialité</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all" value={newParticipant.specialty} onChange={(e) => setNewParticipant({...newParticipant, specialty: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">Annuler</button>
                <button type="submit" className="flex-2 px-8 py-3 bg-odc-orange text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-odc-black transition-all">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-card p-6 rounded-2xl flex flex-wrap gap-4 items-end border border-white/20">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Recherche</label>
          <input
            type="text"
            placeholder="Nom, email, spécialité..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-full bg-white/50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-odc-orange/10 focus:border-odc-orange outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Formation</label>
          <select
            value={filters.formationId}
            onChange={(e) => setFilters((f) => ({ ...f, formationId: e.target.value }))}
            className="bg-white/50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm w-56 focus:ring-2 focus:ring-odc-orange/10 focus:border-odc-orange outline-none transition-all"
          >
            <option value="">Tous les programmes</option>
            {formations.map((f) => (
              <option key={f._id} value={f._id}>{f.title}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 p-2.5 bg-white/50 rounded-xl border border-gray-100 mb-0.5">
          <input
            type="checkbox"
            id="jobDating"
            checked={filters.recommendedForJobDating === 'true'}
            onChange={(e) => setFilters((f) => ({ ...f, recommendedForJobDating: e.target.checked ? 'true' : '' }))}
            className="rounded border-gray-300 text-odc-orange focus:ring-odc-orange w-4 h-4"
          />
          <label htmlFor="jobDating" className="text-xs font-bold text-gray-600 uppercase tracking-tight cursor-pointer">Job Dating Candidate</label>
        </div>
      </div>

      <div className="glass-card rounded-[32px] overflow-hidden border border-white/20 shadow-xl">
        {loading ? (
          <div className="p-20 text-center text-odc-orange font-black uppercase tracking-widest animate-pulse italic">Scanning Community...</div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {data.map((p) => {
              const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim() || '—';
              const gender = p.gender === 'male' ? 'Homme' : p.gender === 'female' ? 'Femme' : p.gender || '—';
              return (
                <article key={p._id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold text-odc-black">{fullName}</h3>
                    {p.recommendedForJobDating && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-odc-orange/10 text-odc-orange">
                        Job Dating
                      </span>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <p><span className="text-gray-400 block">Genre</span><span className="font-semibold text-gray-700">{gender}</span></p>
                    <p><span className="text-gray-400 block">Tranche d'âge</span><span className="font-semibold text-gray-700">{p.ageCategory || '—'}</span></p>
                    <p><span className="text-gray-400 block">Profil</span><span className="font-semibold text-gray-700">{p.profession || '—'}</span></p>
                    <p><span className="text-gray-400 block">Niveau</span><span className="font-semibold text-gray-700">{p.educationLevel || '—'}</span></p>
                    <p className="col-span-2"><span className="text-gray-400 block">Établissement</span><span className="font-semibold text-gray-700">{p.institution || '—'}</span></p>
                    <p className="col-span-2"><span className="text-gray-400 block">Spécialité</span><span className="font-semibold text-gray-700">{p.specialty || '—'}</span></p>
                    <p className="col-span-2"><span className="text-gray-400 block">Email</span><span className="font-semibold text-gray-700 break-all">{p.email || '—'}</span></p>
                    <p className="col-span-2"><span className="text-gray-400 block">Téléphone</span><span className="font-semibold text-gray-700">{p.phone || '—'}</span></p>
                  </div>
                </article>
              );
            })}
            {!data.length && <p className="text-sm text-gray-500">Aucun participant trouvé avec ces filtres.</p>}
          </div>
        )}
        <div className="px-6 py-4 bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          <CountUp end={total} /> Profils indexés
        </div>
      </div>
    </div>
  );
}
