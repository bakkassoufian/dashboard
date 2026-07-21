import React, { useEffect, useState, useRef, useMemo } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, BookOpen, CheckCircle, Clock, GraduationCap, MonitorPlay, Users, Target, Plus, FileUp, X, Upload, Pencil, Trash2, Globe, TrendingUp } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { STATIC_STATS } from '../data/staticStats';

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    dateFrom: start.toISOString().slice(0, 10),
    dateTo: end.toISOString().slice(0, 10),
  };
}

/** entityId côté API : string, ObjectId, ou { _id, name, … } (profil /me) */
function resolveUserEntityId(user) {
  const e = user?.entityId;
  if (e == null || e === '') return null;
  if (typeof e === 'string' || typeof e === 'number') return String(e);
  if (typeof e === 'object' && e._id != null) return String(e._id);
  return null;
}

const STATUS_LABELS = {
  draft: 'Brouillon',
  en_cours_production: 'En cours de production',
  en_cours_validation: 'En cours de validation',
  valide_programme: 'Validé / Programmé',
  publie: 'Publié',
  not_started: 'Non démarré',
};

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

function getProgramType(title, activityType) {
  if (activityType === 'pfe') return 'Stage PFE';
  if (activityType === 'workshop') return 'Atelier / Workshop';
  return 'Formation';
}
export default function Formations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initialMonth = getCurrentMonthRange();
  const [showAddModal, setShowAddModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newFormation, setNewFormation] = useState({
    title: '',
    entityId: '',
    activityType: 'formation',
    trainerName: '',
    description: '',
    location: '',
    dateStart: '',
    dateEnd: '',
    sessionDuration: '',
    timeSlot: '',
    pfeProjectName: '',
    pfeEncadrantName: '',
    pfeStagiaireCount: '',
    pfeAnnee: '',
    pfeStageMonths: '',
  });
  const [data, setData] = useState([]);
  const [entities, setEntities] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entityId: '',
    location: '',
    status: '',
    activityType: '',
    trainerName: '',
    dateFrom: initialMonth.dateFrom,
    dateTo: initialMonth.dateTo,
  });
  const [overview, setOverview] = useState({
    rangeType: 'year',
    anchorDate: new Date().toISOString().slice(0, 10),
  });

  const userEntityId = resolveUserEntityId(user);
  /** Uniquement si aucune entité sur le compte (compte “global” ou jamais rattaché) */
  const needsEntityChoice = !userEntityId;
  const canMutateList =
    user?.role !== 'manager' && ['super_admin', 'coordinator', 'member', 'member-odc-hybrid'].includes(user?.role);

  const handleAddFormation = async (e) => {
    e.preventDefault();
    try {
      if (needsEntityChoice && !newFormation.entityId) {
        alert('Sélectionnez une entité pour cette formation.');
        return;
      }
      const formData = new FormData();
      const pfeOnly = new Set(['pfeProjectName', 'pfeEncadrantName', 'pfeStagiaireCount', 'pfeAnnee', 'pfeStageMonths']);
      Object.entries(newFormation).forEach(([key, val]) => {
        if (key === 'entityId') return;
        if (pfeOnly.has(key) && newFormation.activityType !== 'pfe') return;
        if (val === '' || val == null) return;
        formData.append(key, val);
      });
      if (userEntityId) {
        formData.append('entityId', String(userEntityId));
      } else if (newFormation.entityId) {
        formData.append('entityId', newFormation.entityId);
      }
      if (imageFile) formData.append('image', imageFile);

      await api.post('/formations', formData);
      setShowAddModal(false);
      setImageFile(null);
      setImagePreview(null);
      setNewFormation({
        title: '',
        entityId: '',
        activityType: 'formation',
        trainerName: '',
        description: '',
        location: '',
        dateStart: '',
        dateEnd: '',
        sessionDuration: '',
        timeSlot: '',
        pfeProjectName: '',
        pfeEncadrantName: '',
        pfeStagiaireCount: '',
        pfeAnnee: '',
        pfeStageMonths: '',
      });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteFromList = async (formationId) => {
    if (!window.confirm('Supprimer cette formation ? Les inscriptions / présences liées seront aussi supprimées.')) {
      return;
    }
    try {
      await api.delete(`/formations/${formationId}`);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();

    // Membres : toujours limités à leur entité. Manager / coord / admin : liste globale ou filtre manuel.
    if (['member', 'member-odc-hybrid'].includes(user?.role) && userEntityId) {
      params.set('entityId', userEntityId);
    } else if (filters.entityId) {
      params.set('entityId', filters.entityId);
    }

    if (filters.location) params.set('location', filters.location);
    if (filters.status) params.set('status', filters.status);
    if (filters.activityType) params.set('activityType', filters.activityType);
    if (filters.trainerName) params.set('trainerName', filters.trainerName);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);

    api
      .get(`/formations?${params}`)
      .then((res) => {
        // Filter out types we don't want in Ecole du Code view
        const filtered = (res.data || []).filter(f => {
           const type = getProgramType(f.title, f.activityType);
           return type !== 'Super Codeur (Enfants)' && type !== 'Orange Summer Challenge';
        });
        setData(filtered);
        setTotal(filtered.length);
      })
      .catch(() => {
        setData([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/entities').then((r) => setEntities(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters, userEntityId, user?.role]);

  const ecoleDuCodeEntities = entities.filter(
    (ent) =>
      ent?.type === 'Ecole du Code' ||
      String(ent?.name || '').toLowerCase().includes('ecole du code'),
  );

  const { periodStart, periodEnd } = useMemo(() => {
    const base = overview.anchorDate ? new Date(overview.anchorDate) : new Date();
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    if (overview.rangeType === 'week') {
      const day = d.getDay();
      const diff = day === 0 ? -6 : 1 - day; // monday start
      const start = new Date(d);
      start.setDate(d.getDate() + diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { periodStart: start, periodEnd: end };
    }
    if (overview.rangeType === 'year') {
      return {
        periodStart: new Date(d.getFullYear(), 0, 1),
        periodEnd: new Date(d.getFullYear(), 11, 31),
      };
    }
    return {
      periodStart: new Date(d.getFullYear(), d.getMonth(), 1),
      periodEnd: new Date(d.getFullYear(), d.getMonth() + 1, 0),
    };
  }, [overview.anchorDate, overview.rangeType]);

  const formationsInPeriod = useMemo(
    () =>
      data.filter((f) => {
        const ref = f?.dateStart ? new Date(f.dateStart) : f?.createdAt ? new Date(f.createdAt) : null;
        if (!ref) return false;
        const dateOnly = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
        return dateOnly >= periodStart && dateOnly <= periodEnd;
      }),
    [data, periodStart, periodEnd],
  );

  const overviewStats = useMemo(() => {
    let relevantStats = STATIC_STATS.filter(s => {
       if (filters.location && s.ville && s.ville.toLowerCase() !== filters.location.toLowerCase()) return false;
       return true;
    });

    // We can't perfectly filter by exact date, but if an anchor date year is selected:
    const year = new Date(overview.anchorDate).getFullYear();
    if (overview.rangeType === 'year') {
      relevantStats = relevantStats.filter(s => s.year === year);
    }
    
    // Activity type filter logic (rough approximation)
    if (filters.activityType === 'pfe') {
       relevantStats = relevantStats.filter(s => s.type === 'Stage');
    } else if (filters.activityType === 'super_codeur') {
       relevantStats = relevantStats.filter(s => s.type === 'Super codeur');
    } else if (filters.activityType === 'workshop') {
       relevantStats = relevantStats.filter(s => s.type === 'Evenement' || s.type === 'Talk');
    } else if (filters.activityType === 'formation') {
       relevantStats = relevantStats.filter(s => s.type === 'EDC' || s.type === 'Universite');
    }

    // Cumulative fallbacks
    const CUMULATIVE_FORMATIONS = 775;
    const CUMULATIVE_PARTICIPANTS = 32100;

    let displayFormations = 0;
    let displayParticipants = 0;
    let interns = 0;

    relevantStats.forEach(s => {
       displayFormations += s.formations;
       displayParticipants += s.total;
       if (s.type === 'Stage') {
          interns += s.total;
       }
    });

    const published = formationsInPeriod.filter((f) => f.status === 'publie').length;
    const now = new Date();
    const upcoming = formationsInPeriod.filter((f) => f.dateStart && new Date(f.dateStart) >= now).length;
    
    const hasActiveFilters = filters.entityId || filters.location || filters.activityType || filters.trainerName || overview.rangeType === 'year';
    const isGlobalView = !hasActiveFilters;
    
    if (isGlobalView) {
      displayFormations = CUMULATIVE_FORMATIONS;
      displayParticipants = CUMULATIVE_PARTICIPANTS;
      interns = 0;
      relevantStats.forEach(s => {
         if (s.type === 'Stage') interns += s.total;
      });
    }
    
    const womenPct = 44; // Percentage of women
    const insertionRate = 60; // Insertion rate
    
    // Coursera / JobinTech specific
    const courseraCerts = 1660;
    const courseraHours = 12600;
    const jobinTechTarget = 225;

    return { 
      totalInPeriod: displayFormations || formationsInPeriod.length, 
      published, 
      upcoming, 
      interns, 
      totalParticipants: displayParticipants || Math.round(formationsInPeriod.length * 41.4), 
      womenPct, 
      insertionRate, 
      courseraCerts, 
      courseraHours, 
      jobinTechTarget 
    };
  }, [formationsInPeriod, data.length, filters, overview]);

  const programTypeStats = useMemo(() => {
    const map = {
      Formation: 0,
      'Atelier / Workshop': 0,
      'Stage PFE': 0,
    };
    formationsInPeriod.forEach((f) => {
      const key = getProgramType(f.title, f.activityType);
      map[key] = (map[key] || 0) + 1;
    });
    const stats = [
      { type: 'Formation', count: map.Formation, color: '#FF7900' },
      { type: 'Atelier / Workshop', count: map['Atelier / Workshop'], color: '#64748B' },
      { type: 'Stage PFE', count: map['Stage PFE'], color: '#A855F7' },
    ];
    
    if (overview.rangeType === 'year') {
      return stats.filter(s => s.type !== 'Formation');
    }
    return stats;
  }, [formationsInPeriod, overview.rangeType]);

  const overviewChartData = useMemo(() => {
    const map = {};
    formationsInPeriod.forEach((f) => {
      const raw = f.dateStart || f.createdAt;
      if (!raw) return;
      const d = new Date(raw);
      let key = '';
      if (overview.rangeType === 'year') key = d.toLocaleDateString('fr-FR', { month: 'short' });
      else key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([label, count]) => ({ label, count }));
  }, [formationsInPeriod, overview.rangeType]);

  return (
    <div className="space-y-2 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="École du Code" 
          description="Suivi des formations, sessions et activités pédagogiques."
          badge="Formations"
        />
        {user?.role !== 'manager' &&
          ['super_admin', 'coordinator', 'member', 'member-odc-hybrid'].includes(user?.role) && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/import')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
            >
              <FileUp className="w-4 h-4" />
              Importer
            </button>
            <button
              type="button"
              onClick={() => {
                if (needsEntityChoice && filters.entityId) {
                  setNewFormation((nf) => ({ ...nf, entityId: filters.entityId }));
                }
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-odc-orange text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:bg-odc-black transition-all"
            >
              <Plus className="w-4 h-4" />
              Ajouter formation
            </button>
          </div>
        )}
      </div>

      {/* Add Formation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-odc-black mb-6">Nouvelle activité</h3>
            <form onSubmit={handleAddFormation} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {needsEntityChoice && (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Entité</label>
                  <select
                    required
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all"
                    value={newFormation.entityId}
                    onChange={(e) => setNewFormation({ ...newFormation, entityId: e.target.value })}
                  >
                    <option value="">Sélectionner une entité</option>
                    {(ecoleDuCodeEntities.length > 0 ? ecoleDuCodeEntities : entities).map((ent) => (
                      <option key={ent._id} value={ent._id}>
                        {ent.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Titre de la formation</label>
                <input 
                  type="text" required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all"
                  value={newFormation.title}
                  onChange={(e) => setNewFormation({...newFormation, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Type d&apos;activité</label>
                <select
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all"
                  value={newFormation.activityType}
                  onChange={(e) => setNewFormation({ ...newFormation, activityType: e.target.value })}
                >
                  <option value="formation">Formation</option>
                  <option value="workshop">Atelier / Workshop</option>
                  <option value="pfe">PFE / Stage &amp; soutenance</option>
                </select>
              </div>
              {newFormation.activityType === 'pfe' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/80">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nom du projet PFE</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange"
                      value={newFormation.pfeProjectName}
                      onChange={(e) => setNewFormation({ ...newFormation, pfeProjectName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Encadrant</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange"
                      value={newFormation.pfeEncadrantName}
                      onChange={(e) => setNewFormation({ ...newFormation, pfeEncadrantName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nb stagiaires</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange"
                      value={newFormation.pfeStagiaireCount}
                      onChange={(e) => setNewFormation({ ...newFormation, pfeStagiaireCount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Année</label>
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      placeholder="ex. 2026"
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange"
                      value={newFormation.pfeAnnee}
                      onChange={(e) => setNewFormation({ ...newFormation, pfeAnnee: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Durée (mois)</label>
                    <input
                      type="number"
                      min="0"
                      max="36"
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange"
                      value={newFormation.pfeStageMonths}
                      onChange={(e) => setNewFormation({ ...newFormation, pfeStageMonths: e.target.value })}
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Formateur</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all"
                  value={newFormation.trainerName}
                  onChange={(e) => setNewFormation({ ...newFormation, trainerName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  rows="3"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all resize-none"
                  value={newFormation.description}
                  onChange={(e) => setNewFormation({...newFormation, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date de début</label>
                  <input
                    type="date"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all"
                    value={newFormation.dateStart}
                    onChange={(e) => setNewFormation({ ...newFormation, dateStart: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date de fin</label>
                  <input
                    type="date"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all"
                    value={newFormation.dateEnd}
                    onChange={(e) => setNewFormation({ ...newFormation, dateEnd: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Durée (libre)</label>
                  <input
                    type="text"
                    placeholder="ex. 3 jours, 5 séances"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all"
                    value={newFormation.sessionDuration}
                    onChange={(e) => setNewFormation({ ...newFormation, sessionDuration: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Créneau horaire</label>
                  <input
                    type="text"
                    placeholder="ex. 09h00 – 16h00"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all"
                    value={newFormation.timeSlot}
                    onChange={(e) => setNewFormation({ ...newFormation, timeSlot: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Lieu (ville / salle)</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all"
                    value={newFormation.location}
                    onChange={(e) => setNewFormation({ ...newFormation, location: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Image de couverture</label>
                <div className="relative group">
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${imagePreview ? 'border-odc-orange bg-orange-50/10' : 'border-gray-200 bg-gray-50 group-hover:border-gray-300'}`}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Cliquez pour choisir une image</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">Annuler</button>
                <button type="submit" className="flex-2 px-8 py-3 bg-odc-orange text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-odc-black transition-all">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="glass-card rounded-[32px] border border-white/20 shadow-xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-odc-black">Aperçu des activités (École du Code)</h2>
            <p className="text-sm text-gray-500">Suivi par semaine, mois ou année avec vue calendrier.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ville</label>
              <select
                value={filters.location}
                onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm w-48"
              >
                <option value="">Toutes les villes</option>
                <option value="Casablanca">Casablanca</option>
                <option value="Rabat">Rabat</option>
                <option value="Agadir">Agadir</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Type d&apos;activité</label>
              <select
                value={filters.activityType}
                onChange={(e) => setFilters((f) => ({ ...f, activityType: e.target.value }))}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm w-48"
              >
                <option value="">Tous les types</option>
                <option value="formation">Formation</option>
                <option value="workshop">Atelier / Workshop</option>
                <option value="super_codeur">Super Codeur</option>
                <option value="pfe">PFE / Stage</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Période</label>
              <select
                value={overview.rangeType}
                onChange={(e) => setOverview((o) => ({ ...o, rangeType: e.target.value }))}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                <option value="week">Semaine</option>
                <option value="month">Mois</option>
                <option value="year">Année</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date repère</label>
              <input
                type="date"
                value={overview.anchorDate}
                onChange={(e) => setOverview((o) => ({ ...o, anchorDate: e.target.value }))}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Card 1: Participants & Gender */}
          <div className="glass-card p-6 rounded-[24px] relative overflow-hidden group transition-all hover:scale-[1.02] border-b-[6px] border-odc-orange bg-white">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 rounded-2xl bg-orange-50 text-odc-orange shadow-sm"><Users className="w-5 h-5"/></div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter text-right">
                Parité: <span className="text-odc-orange">{overviewStats.womenPct}% F</span> / {100 - overviewStats.womenPct}% H
              </div>
            </div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 relative z-10">Total Bénéficiaires</p>
            <p className="text-4xl font-black text-odc-black relative z-10"><CountUp end={overviewStats.totalParticipants} /></p>
            <Users className="absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.03] text-odc-orange pointer-events-none group-hover:scale-110 transition-transform duration-500"/>
          </div>

          {/* Card 2: Formations */}
          <div className="glass-card p-6 rounded-[24px] relative overflow-hidden group transition-all hover:scale-[1.02] border-b-[6px] border-black bg-white">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 rounded-2xl bg-gray-100 text-black shadow-sm"><BookOpen className="w-5 h-5"/></div>
              <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+{overviewStats.published} PUBLIÉS</div>
            </div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 relative z-10">Nombre de Formations</p>
            <p className="text-4xl font-black text-odc-black relative z-10"><CountUp end={overviewStats.totalInPeriod} /></p>
            <BookOpen className="absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.03] text-black pointer-events-none group-hover:scale-110 transition-transform duration-500"/>
          </div>

          {/* Card 3: Stagiaires */}
          <div className="glass-card p-6 rounded-[24px] relative overflow-hidden group transition-all hover:scale-[1.02] border-b-[6px] border-black bg-white">
             <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 rounded-2xl bg-gray-100 text-black shadow-sm"><GraduationCap className="w-5 h-5"/></div>
            </div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 relative z-10">Nombre de Stagiaires</p>
            <p className="text-4xl font-black text-odc-black relative z-10"><CountUp end={overviewStats.interns} /></p>
            <GraduationCap className="absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.03] text-black pointer-events-none group-hover:scale-110 transition-transform duration-500"/>
          </div>

          {/* Card 4: Insertion */}
          <div className="glass-card p-6 rounded-[24px] relative overflow-hidden group transition-all hover:scale-[1.02] border-b-[6px] border-odc-orange bg-white">
             <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 rounded-2xl bg-orange-50 text-odc-orange shadow-sm"><Target className="w-5 h-5"/></div>
              <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">EXCELLENT</div>
            </div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 relative z-10">État d'Insertion</p>
            <p className="text-4xl font-black text-odc-black relative z-10"><CountUp end={overviewStats.insertionRate} suffix="%" /></p>
            <Target className="absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.03] text-odc-orange pointer-events-none group-hover:scale-110 transition-transform duration-500"/>
          </div>
        </div>

        {/* Specialized Programs: Coursera & JobinTech */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="glass-card p-6 rounded-[24px] bg-white border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all border-l-8 border-blue-600">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Partenariat Coursera</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <p className="text-3xl font-black text-blue-600">{overviewStats.courseraCerts.toLocaleString()}</p>
                      <p className="text-[10px] font-bold uppercase text-gray-500">Certifications</p>
                   </div>
                   <div>
                      <p className="text-3xl font-black text-blue-600">{overviewStats.courseraHours.toLocaleString()}</p>
                      <p className="text-[10px] font-bold uppercase text-gray-500">Heures de formation</p>
                   </div>
                </div>
              </div>
              <Globe className="absolute -right-10 -bottom-10 w-48 h-48 opacity-[0.03] text-blue-600 pointer-events-none group-hover:scale-110 transition-transform" />
           </div>

           <div className="glass-card p-6 rounded-[24px] bg-white border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all border-l-8 border-emerald-600">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">JobInTech</span>
                </div>
                <div>
                   <p className="text-3xl font-black text-emerald-600">{overviewStats.jobinTechTarget}</p>
                   <p className="text-[10px] font-bold uppercase text-gray-500">Apprenants (Objectif 2026)</p>
                   <div className="mt-4 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
                   </div>
                </div>
              </div>
              <TrendingUp className="absolute -right-10 -bottom-10 w-48 h-48 opacity-[0.03] text-emerald-600 pointer-events-none group-hover:scale-110 transition-transform" />
           </div>
        </div>



        {overview.rangeType === 'year' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs uppercase font-bold text-gray-400 mb-3">Distribution des formations</p>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overviewChartData}>
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FF7900" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs uppercase font-black tracking-widest text-gray-400 mb-6 inline-flex items-center gap-2">
                <CalendarDays className="w-4 h-4" /> Calendrier de la période
              </p>
              <div className="space-y-4 max-h-[300px] overflow-auto pr-1 custom-scrollbar">
                {formationsInPeriod.slice(0, 15).map((f) => {
                  const date = f.dateStart ? new Date(f.dateStart) : null;
                  const day = date ? date.getDate() : '--';
                  const month = date ? date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '') : '??';
                  return (
                    <div key={f._id} className="flex items-center gap-4 group cursor-pointer hover:bg-gray-50 p-2 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                      <div className="flex-shrink-0 w-12 h-14 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center group-hover:bg-odc-orange/5 group-hover:border-odc-orange/20 transition-colors">
                        <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-odc-orange transition-colors">{month}</span>
                        <span className="text-lg font-black text-odc-black leading-none">{day}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-odc-black truncate group-hover:text-odc-orange transition-colors">{f.title || 'Sans titre'}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] font-bold text-gray-400">{f.location || 'Lieu non défini'}</span>
                           <span className="w-1 h-1 bg-gray-200 rounded-full" />
                           <span className="text-[10px] font-bold text-gray-400">{f.activityType === 'pfe' ? 'PFE' : 'Formation'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!formationsInPeriod.length && (
                  <div className="py-10 text-center">
                    <p className="text-sm text-gray-400 font-medium italic">Aucune activité prévue.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="glass-card rounded-[32px] overflow-hidden border border-white/20 shadow-xl">
        {loading ? (
          <div className="p-20 text-center text-odc-orange font-black uppercase tracking-widest animate-pulse italic">Interrogating Database...</div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {data.map((formation) => {
              const location = formation.location ?? formation.entityId?.location ?? '—';
              const entity = formation.entityId?.name ?? formation.entityId?.type ?? '—';
              const trainer = formation.trainerName ?? '—';
              const date = formation.dateStart ? new Date(formation.dateStart).toLocaleDateString('fr-FR') : '—';
              const time = formation.timeSlot ?? '—';
              const status = STATUS_LABELS[formation.status] ?? formation.status ?? '—';
              return (
                <article 
                  key={formation._id} 
                  onClick={() => navigate(`/formations/${formation._id}`)}
                  className="rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2 relative z-10">
                    <div className="min-w-0 pr-1">
                      <h3 className="text-md font-black text-odc-black leading-tight group-hover:text-odc-orange transition-colors">{formation.title ?? '—'}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                        {getProgramType(formation.title, formation.activityType)}
                        {typeof formation.validesCount === 'number' && formation.validesCount > 0 && (
                          <span className="text-odc-orange"> · {formation.validesCount} validé(s)</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {canMutateList && (
                        <>
                          <button
                            type="button"
                            onClick={() => navigate(`/formations/${formation._id}`)}
                            className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-odc-orange hover:border-odc-orange/30 transition-all"
                            title="Modifier"
                            aria-label="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFromList(formation._id)}
                            className="p-2 rounded-xl bg-gray-50 border border-red-100 text-red-500 hover:bg-red-50 transition-all"
                            title="Supprimer"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <span className="shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-orange-50 text-odc-orange border border-orange-100 max-w-[6.5rem] text-center leading-tight">
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-xs relative z-10">
                    <p><span className="text-gray-400 font-black uppercase text-[9px] tracking-widest block mb-1">Ville</span><span className="font-bold text-gray-700">{location}</span></p>
                    <p><span className="text-gray-400 font-black uppercase text-[9px] tracking-widest block mb-1">Entité</span><span className="font-bold text-gray-700">{entity}</span></p>
                    <p><span className="text-gray-400 font-black uppercase text-[9px] tracking-widest block mb-1">Formateur</span><span className="font-bold text-gray-700">{trainer}</span></p>
                    <p><span className="text-gray-400 font-black uppercase text-[9px] tracking-widest block mb-1">Date</span><span className="font-bold text-gray-700">{date}</span></p>
                    <p className="col-span-2"><span className="text-gray-400 font-black uppercase text-[9px] tracking-widest block mb-1">Heure</span><span className="font-bold text-gray-700">{time}</span></p>
                    <p className="col-span-2">
                      <span className="text-gray-400 font-black uppercase text-[9px] tracking-widest block mb-1">Inscrits</span>
                      <span className="font-bold text-gray-700">{typeof formation.inscritsCount === 'number' ? formation.inscritsCount : 0}</span>
                      <span className="text-[10px] text-gray-400 font-medium ml-1">· fiche / import</span>
                    </p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between relative z-10">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-500">Ouvrir la fiche</span>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-orange-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </article>
              );
            })}
            {!data.length && <p className="text-sm text-gray-500">Aucune formation trouvée avec ces filtres.</p>}
          </div>
        )}
        <div className="px-6 py-4 bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          <CountUp end={total} /> Sessions identifiées
        </div>
      </div>
    </div>
  );
}
