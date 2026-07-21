import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { api } from '../api/client';
import {
  ArrowLeft,
  Users,
  GraduationCap,
  Calendar,
  MapPin,
  Clock,
  FileUp,
  Award,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Search,
  Filter,
  Mail,
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_LABELS = {
  draft: 'Brouillon',
  en_cours_production: 'En cours de production',
  en_cours_validation: 'En cours de validation',
  valide_programme: 'Validé / Programmé',
  publie: 'Publié',
  not_started: 'Non démarré',
};

const ATT_LABELS = {
  inscrit: 'Inscrit',
  confirme: 'Confirmé',
  confirme_present: 'Présent',
  valide: 'Validé',
  absent: 'Absent',
};

function dateToInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function canEditFormationSession(user) {
  if (!user || user.role === 'manager') return false;
  if (['super_admin', 'coordinator', 'member-odc-hybrid'].includes(user.role)) return true;
  if (user.role === 'member') {
    return true;
  }
  return false;
}

export default function FormationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formation, setFormation] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    age: '',
    institution: '',
    participation: '',
  });
  const [sessionForm, setSessionForm] = useState({
    dateStart: '',
    dateEnd: '',
    sessionDuration: '',
    timeSlot: '',
    location: '',
    status: 'draft',
    inscritsCount: '0',
    confirmesCount: '0',
    validesCount: '0',
    skipStatsOnImport: false,
  });
  const [savingSession, setSavingSession] = useState(false);
  const [infoForm, setInfoForm] = useState({
    title: '',
    description: '',
    trainerName: '',
    activityType: 'formation',
    pfeProjectName: '',
    pfeEncadrantName: '',
    pfeStagiaireCount: '',
    pfeAnnee: '',
    pfeStageMonths: '',
  });
  const [savingInfo, setSavingInfo] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const fRes = await api.get(`/formations/${id}`);
        const attRes = await api.get(`/attendance?formationId=${id}`);
        if (cancelled) return;
        setFormation(fRes.data || null);
        const list = attRes.data || [];
        const mapped = list
          .map((a) => {
            const p = a.participantId;
            if (!p || typeof p === 'string') return null;
            return {
              id: a._id,
              firstName: p.firstName || '',
              lastName: p.lastName || '',
              gender: p.gender || '',
              age: p.age || '',
              institution: p.institution || '',
              email: p.email || '',
              phone: p.phone || '',
              status: a.status || 'inscrit',
            };
          })
          .filter(Boolean);
        setRows(mapped);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Impossible de charger cette formation.');
          setFormation(null);
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!formation) return;
    setSessionForm({
      dateStart: dateToInputValue(formation.dateStart),
      dateEnd: dateToInputValue(formation.dateEnd),
      sessionDuration: formation.sessionDuration || '',
      timeSlot: formation.timeSlot || '',
      location: formation.location || '',
      status: formation.status || 'draft',
      inscritsCount: String(formation.inscritsCount ?? 0),
      confirmesCount: String(formation.confirmesCount ?? 0),
      validesCount: String(formation.validesCount ?? 0),
      skipStatsOnImport: !!formation.skipStatsOnImport,
    });
  }, [formation]);

  useEffect(() => {
    if (!formation) return;
    setInfoForm({
      title: formation.title || '',
      description: formation.description || '',
      trainerName: formation.trainerName || '',
      activityType: formation.activityType || 'formation',
      pfeProjectName: formation.pfeProjectName || '',
      pfeEncadrantName: formation.pfeEncadrantName || '',
      pfeStagiaireCount: formation.pfeStagiaireCount != null ? String(formation.pfeStagiaireCount) : '',
      pfeAnnee: formation.pfeAnnee != null ? String(formation.pfeAnnee) : '',
      pfeStageMonths: formation.pfeStageMonths != null ? String(formation.pfeStageMonths) : '',
    });
  }, [formation]);

  const handleSaveInfo = async () => {
    if (!id) return;
    if (!infoForm.title.trim()) {
      alert('Le titre est obligatoire.');
      return;
    }
    setSavingInfo(true);
    try {
      const body = {
        title: infoForm.title.trim(),
        description: infoForm.description.trim() || undefined,
        trainerName: infoForm.trainerName.trim() || undefined,
        activityType: infoForm.activityType,
      };
      if (infoForm.activityType === 'pfe') {
        if (infoForm.pfeProjectName) body.pfeProjectName = infoForm.pfeProjectName.trim();
        if (infoForm.pfeEncadrantName) body.pfeEncadrantName = infoForm.pfeEncadrantName.trim();
        const ns = (v) => (v === '' || v == null ? undefined : Number(v));
        const a = ns(infoForm.pfeStagiaireCount);
        const b = ns(infoForm.pfeAnnee);
        const c = ns(infoForm.pfeStageMonths);
        if (a != null && !Number.isNaN(a)) body.pfeStagiaireCount = a;
        if (b != null && !Number.isNaN(b)) body.pfeAnnee = b;
        if (c != null && !Number.isNaN(c)) body.pfeStageMonths = c;
      }
      const res = await api.patch(`/formations/${id}`, body);
      setFormation(res.data || null);
    } catch (e) {
      alert(e.message || 'Enregistrement impossible');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleDeleteFormation = async () => {
    if (!id) return;
    if (!window.confirm('Supprimer cette formation ? Les inscriptions / présences liées seront aussi supprimées.')) {
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/formations/${id}`);
      navigate('/formations');
    } catch (e) {
      alert(e.message || 'Suppression impossible');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveSession = async () => {
    if (!id) return;
    setSavingSession(true);
    try {
      const toInt = (v) => {
        if (v === '' || v == null) return 0;
        const n = Number(v);
        return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
      };
      const body = {
        timeSlot: sessionForm.timeSlot.trim() || undefined,
        location: sessionForm.location.trim() || undefined,
        sessionDuration: sessionForm.sessionDuration.trim() || undefined,
        status: sessionForm.status,
        inscritsCount: toInt(sessionForm.inscritsCount),
        confirmesCount: toInt(sessionForm.confirmesCount),
        validesCount: toInt(sessionForm.validesCount),
        skipStatsOnImport: !!sessionForm.skipStatsOnImport,
      };
      if (sessionForm.dateStart) {
        body.dateStart = new Date(sessionForm.dateStart).toISOString();
      } else {
        body.dateStart = null;
      }
      if (sessionForm.dateEnd) {
        body.dateEnd = new Date(sessionForm.dateEnd).toISOString();
      } else {
        body.dateEnd = null;
      }
      const res = await api.patch(`/formations/${id}`, body);
      setFormation(res.data || null);
    } catch (e) {
      alert(e.message || 'Enregistrement impossible');
    } finally {
      setSavingSession(false);
    }
  };

  const PARTICIPATED = useMemo(() => new Set(['valide', 'confirme_present', 'confirme']), []);

  const filteredParticipants = useMemo(() => {
    return rows.filter((p) => {
      const matchesSearch = `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGender = !filters.gender || p.gender === filters.gender;
      const matchesAge = !filters.age || p.age === filters.age;
      const matchesSchool = !filters.institution || (p.institution && p.institution.includes(filters.institution));
      const matchesPart =
        !filters.participation ||
        (filters.participation === 'participated' && PARTICIPATED.has(p.status));
      return matchesSearch && matchesGender && matchesAge && matchesSchool && matchesPart;
    });
  }, [rows, searchTerm, filters, PARTICIPATED]);

  const handleManageParticipants = () => {
    navigate('/import', { state: { formationId: id, formationTitle: formation?.title } });
  };

  if (loading) {
    return (
      <div className="p-20 text-center text-odc-orange font-black uppercase tracking-widest animate-pulse">
        Chargement…
      </div>
    );
  }

  if (error || !formation) {
    return (
      <div className="space-y-6 p-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-odc-orange"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <div className="glass-card p-8 rounded-2xl text-center text-gray-600">
          {error || 'Formation introuvable.'}
        </div>
      </div>
    );
  }

  const statusFr = STATUS_LABELS[formation.status] || formation.status;
  const dateStr = formation.dateStart
    ? new Date(formation.dateStart).toLocaleDateString('fr-FR')
    : '—';
  const dateEndStr = formation.dateEnd
    ? new Date(formation.dateEnd).toLocaleDateString('fr-FR')
    : '—';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-odc-orange transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Retour à la liste
      </button>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <PageHeader title={formation.title} description={formation.description || '—'} badge="Détails formation" />
        <div className="flex flex-wrap gap-3 justify-end">
          {canEditFormationSession(user) && (
            <button
              type="button"
              onClick={handleDeleteFormation}
              disabled={deleting}
              className="flex items-center gap-2 px-5 py-3 border-2 border-red-200 text-red-600 bg-white rounded-2xl text-sm font-black hover:bg-red-50 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? '…' : 'Supprimer'}
            </button>
          )}
          {user?.role !== 'manager' && (['super_admin', 'coordinator'].includes(user?.role) ||
            canEditFormationSession(user)) && (
            <button
              type="button"
              onClick={handleManageParticipants}
              className="flex items-center gap-2 px-6 py-3 bg-odc-orange text-white rounded-2xl text-sm font-black shadow-lg shadow-orange-500/20 hover:bg-odc-black transition-all"
            >
              <FileUp className="w-4 h-4" />
              Importer participants
            </button>
          )}
        </div>
      </div>

      {/* Metrics removed as requested */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 rounded-[32px] bg-white border border-gray-100">
            <h3 className="text-xl font-black mb-4 tracking-tight">Titre & contenu</h3>
            {canEditFormationSession(user) ? (
              <div className="space-y-4 max-w-3xl">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Titre</label>
                  <input
                    type="text"
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                    value={infoForm.title}
                    onChange={(e) => setInfoForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Type d&apos;activité</label>
                  <select
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                    value={infoForm.activityType}
                    onChange={(e) => setInfoForm((f) => ({ ...f, activityType: e.target.value }))}
                  >
                    <option value="formation">Formation</option>
                    <option value="workshop">Atelier / Workshop</option>
                    <option value="super_codeur">Super Codeur (enfants)</option>
                    <option value="pfe">PFE / Stage &amp; soutenance</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Formateur</label>
                  <input
                    type="text"
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                    value={infoForm.trainerName}
                    onChange={(e) => setInfoForm((f) => ({ ...f, trainerName: e.target.value }))}
                  />
                </div>
                {infoForm.activityType === 'pfe' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/80">
                    <div className="sm:col-span-2">
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Projet PFE</label>
                      <input
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                        value={infoForm.pfeProjectName}
                        onChange={(e) => setInfoForm((f) => ({ ...f, pfeProjectName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Encadrant</label>
                      <input
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                        value={infoForm.pfeEncadrantName}
                        onChange={(e) => setInfoForm((f) => ({ ...f, pfeEncadrantName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Nb stagiaires</label>
                      <input
                        type="number"
                        min="0"
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                        value={infoForm.pfeStagiaireCount}
                        onChange={(e) => setInfoForm((f) => ({ ...f, pfeStagiaireCount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Année</label>
                      <input
                        type="number"
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                        value={infoForm.pfeAnnee}
                        onChange={(e) => setInfoForm((f) => ({ ...f, pfeAnnee: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Durée (mois)</label>
                      <input
                        type="number"
                        min="0"
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                        value={infoForm.pfeStageMonths}
                        onChange={(e) => setInfoForm((f) => ({ ...f, pfeStageMonths: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Description</label>
                  <textarea
                    rows={5}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700"
                    value={infoForm.description}
                    onChange={(e) => setInfoForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Programme, objectifs…"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveInfo}
                  disabled={savingInfo}
                  className="px-6 py-2.5 rounded-xl bg-odc-black text-white text-sm font-black uppercase tracking-wider hover:bg-odc-orange transition-colors disabled:opacity-50"
                >
                  {savingInfo ? 'Enregistrement…' : 'Enregistrer le titre & le contenu'}
                </button>
              </div>
            ) : (
              <>
                {formation.description ? (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{formation.description}</p>
                ) : (
                  <p className="text-sm text-gray-400">Aucune description.</p>
                )}
              </>
            )}
          </div>

          <div className="glass-card p-8 rounded-[32px] bg-white border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-black tracking-tight">Participants</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Import en fin de parcours — filtrez ceux qui ont participé
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Rechercher…"
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-odc-orange outline-none w-48 md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filtres</span>
              </div>
              <select
                className="bg-transparent text-xs font-bold outline-none"
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              >
                <option value="">Genre</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="other">Autre</option>
              </select>
              <input
                type="text"
                placeholder="Âge"
                className="bg-transparent text-xs font-bold outline-none border-b border-gray-200 w-20"
                value={filters.age}
                onChange={(e) => setFilters({ ...filters, age: e.target.value })}
              />
              <input
                type="text"
                placeholder="Institution / école"
                className="bg-transparent text-xs font-bold outline-none border-b border-gray-200 flex-1 min-w-[120px]"
                value={filters.institution}
                onChange={(e) => setFilters({ ...filters, institution: e.target.value })}
              />
              <select
                className="bg-transparent text-xs font-bold outline-none border border-gray-200 rounded-lg px-2 py-1"
                value={filters.participation}
                onChange={(e) => setFilters({ ...filters, participation: e.target.value })}
              >
                <option value="">Tous les statuts</option>
                <option value="participated">Ont participé (validé / confirmé / présent)</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Participant</th>
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Genre / âge</th>
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Institution</th>
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Inscription</th>
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredParticipants.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                        Aucun participant lié à cette formation (importez une liste ou créez des présences).
                      </td>
                    </tr>
                  )}
                  {filteredParticipants.map((p) => (
                    <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-odc-orange flex items-center justify-center font-bold text-xs uppercase">
                            {(p.firstName[0] || '?') + (p.lastName[0] || '')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {p.firstName} {p.lastName}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">{p.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-xs font-bold text-gray-600">
                          {p.gender === 'female' ? 'F' : p.gender === 'male' ? 'H' : p.gender || '—'} · {p.age || '—'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-xs font-medium text-gray-500">{p.institution || '—'}</span>
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                            p.status === 'valide' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-odc-orange'
                          }`}
                        >
                          {ATT_LABELS[p.status] || p.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.email && (
                            <a
                              href={`mailto:${p.email}`}
                              className="p-2 bg-gray-50 hover:bg-white rounded-lg text-gray-400 hover:text-odc-orange border border-transparent hover:border-gray-100"
                              aria-label="Email"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                          {p.phone && (
                            <a
                              href={`tel:${p.phone}`}
                              className="p-2 bg-gray-50 hover:bg-white rounded-lg text-gray-400 hover:text-odc-orange border border-transparent hover:border-gray-100"
                              aria-label="Téléphone"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-8 rounded-[32px] bg-white border border-gray-100">
            <h3 className="text-xl font-black mb-6 tracking-tight">Logistique</h3>
            {canEditFormationSession(user) ? (
              <div className="space-y-4">
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                  Dates, durée et effectifs : <strong>saisie manuelle</strong>. Cochez l’option import si les totaux
                  doivent rester figés après import.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Date de début</label>
                    <input
                      type="date"
                      className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                      value={sessionForm.dateStart}
                      onChange={(e) => setSessionForm((s) => ({ ...s, dateStart: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Date de fin</label>
                    <input
                      type="date"
                      className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                      value={sessionForm.dateEnd}
                      onChange={(e) => setSessionForm((s) => ({ ...s, dateEnd: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Durée (libre)</label>
                  <input
                    type="text"
                    placeholder="ex. 3 jours, 5 séances, 20h"
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                    value={sessionForm.sessionDuration}
                    onChange={(e) => setSessionForm((s) => ({ ...s, sessionDuration: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Créneau horaire</label>
                  <input
                    type="text"
                    placeholder="ex. 09h00 – 16h00"
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                    value={sessionForm.timeSlot}
                    onChange={(e) => setSessionForm((s) => ({ ...s, timeSlot: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Lieu</label>
                  <input
                    type="text"
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                    value={sessionForm.location}
                    onChange={(e) => setSessionForm((s) => ({ ...s, location: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Valid.</label>
                    <input
                      type="number"
                      min="0"
                      className="mt-1 w-full border border-gray-200 rounded-xl px-2 py-2 text-sm font-bold"
                      value={sessionForm.validesCount}
                      onChange={(e) => setSessionForm((s) => ({ ...s, validesCount: e.target.value }))}
                    />
                  </div>
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-gray-300"
                    checked={sessionForm.skipStatsOnImport}
                    onChange={(e) => setSessionForm((s) => ({ ...s, skipStatsOnImport: e.target.checked }))}
                  />
                  <span className="text-[11px] text-gray-600 leading-snug">
                    Ne pas recalculer inscrits / confirmés / validés à l’import (conserver la saisie manuelle)
                  </span>
                </label>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Statut</label>
                  <select
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                    value={sessionForm.status}
                    onChange={(e) => setSessionForm((s) => ({ ...s, status: e.target.value }))}
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <InfoItem
                  icon={Users}
                  label="Formateur"
                  value={formation.trainerName || '—'}
                />
                <InfoItem
                  icon={GraduationCap}
                  label="Entité"
                  value={formation.entityId?.name || formation.entityId?.type || '—'}
                />
                <button
                  type="button"
                  onClick={handleSaveSession}
                  disabled={savingSession}
                  className="w-full py-3 rounded-xl bg-odc-orange text-white text-sm font-black uppercase tracking-wider hover:bg-odc-black transition-colors disabled:opacity-50"
                >
                  {savingSession ? 'Enregistrement…' : 'Enregistrer la session'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <InfoItem icon={Calendar} label="Date de début" value={dateStr} />
                <InfoItem icon={Calendar} label="Date de fin" value={dateEndStr} />
                {formation.sessionDuration && (
                  <InfoItem icon={Clock} label="Durée" value={formation.sessionDuration} />
                )}
                <InfoItem icon={Clock} label="Créneau" value={formation.timeSlot || '—'} />
                <InfoItem icon={MapPin} label="Lieu" value={formation.location || '—'} />
                <InfoItem icon={Users} label="Formateur" value={formation.trainerName || '—'} />
                <InfoItem
                  icon={GraduationCap}
                  label="Entité"
                  value={formation.entityId?.name || formation.entityId?.type || '—'}
                />
              </div>
            )}
          </div>

          <div className="p-8 rounded-[32px] bg-odc-black text-white relative overflow-hidden group shadow-2xl shadow-black/20">
            <div className="relative z-10">
              <h4 className="text-lg font-black mb-2 tracking-tight">Besoin d&apos;aide ?</h4>
              <p className="text-xs text-white/60 mb-6 font-medium">Contactez le coordinateur pour toute modification.</p>
            </div>
            <AlertCircle className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, uppercase = false, hint }) {
  const isOrange = color === 'orange';
  return (
    <div
      className={`glass-card p-6 rounded-[24px] border border-gray-100 bg-white relative overflow-hidden group hover:shadow-lg transition-all border-b-4 ${
        isOrange ? 'border-odc-orange' : 'border-black'
      }`}
    >
      <div
        className={`p-3 rounded-xl mb-4 w-fit ${isOrange ? 'bg-orange-50 text-odc-orange' : 'bg-gray-100 text-black'}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</p>
      <h4 className={`text-2xl font-black mt-1 tracking-tight ${uppercase ? 'uppercase' : ''}`}>{value}</h4>
      {hint && <p className="text-[9px] text-gray-400 mt-2 font-medium leading-snug">{hint}</p>}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className="p-2 bg-white rounded-lg text-odc-orange shadow-sm">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xs font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
