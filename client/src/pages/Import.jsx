import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { uploadFile, api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, CheckCircle, AlertCircle, Info, Link2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const ACTIVITY_LABELS = {
  formation: 'Formation',
  workshop: 'Atelier / Workshop',
  super_codeur: 'Super Codeur',
  pfe: 'PFE / Stage',
};

const EXPECTED_COLS = [
  'Name',
  'Last name',
  'Gender',
  'Age',
  'socio-professional category',
  'if student, specify university',
  'if student, specify the specialty',
  'e-mail',
  'Phone Number',
  'Lieu / Place',
  'Training Date',
  'Training Duration (days)',
  'Name of Training conducted',
];

export default function Import() {
  const { user } = useAuth();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formations, setFormations] = useState([]);
  const [formationId, setFormationId] = useState('');
  const [loadingFormations, setLoadingFormations] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const mustPickActivity = ['member', 'member-odc-hybrid'].includes(user?.role) && user?.entityId?._id;

  useEffect(() => {
    const fromNav = location.state?.formationId;
    if (fromNav) setFormationId(String(fromNav));
  }, [location.state]);

  useEffect(() => {
    const params = new URLSearchParams({ limit: '200' });
    if (['member', 'member-odc-hybrid'].includes(user?.role) && user?.entityId?._id) {
      params.set('entityId', user.entityId._id);
    }
    setLoadingFormations(true);
    api
      .get(`/formations?${params}`)
      .then((res) => {
        setFormations((res.data || []).filter((f) => f && f._id));
      })
      .catch(() => setFormations([]))
      .finally(() => setLoadingFormations(false));
  }, [user?.entityId?._id, user?.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Veuillez sélectionner un fichier Excel/CSV.');
      return;
    }
    if (mustPickActivity && !formationId) {
      setError('Sélectionnez l’activité (formation, atelier, PFE, etc.) concernée par cette liste — les participants y seront rattachés.');
      return;
    }
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const extra = {};
      if (formationId) extra.formationId = formationId;
      const res = await uploadFile('/import/participants-excel', file, extra);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'import.');
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Centre d'Importation"
        description="Importez la liste de participants en fin d’activité. Liez l’import à la bonne fiche (formation, atelier, PFE, Super Codeur) pour alimenter les compteurs de validation."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
              <Info className="w-4 h-4" /> Valeurs imposées
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Tranches d'âge</p>
                <div className="flex flex-wrap gap-1.5">
                  {['< 15 years', '15 - 24 years', '25 - 34 years', '>= 35 years'].map(v => (
                    <span key={v} className="px-2 py-0.5 bg-blue-50 text-[9px] font-bold text-blue-600 rounded-md border border-blue-100">{v}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Statut Professionnel</p>
                <div className="flex flex-wrap gap-1.5">
                  {['employee', 'student / pupil', 'retired', 'job seeker', 'unemployed', 'other'].map(v => (
                    <span key={v} className="px-2 py-0.5 bg-purple-50 text-[9px] font-bold text-purple-600 rounded-md border border-purple-100">{v}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Lieux / Entités</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Coding School', 'FabLab', 'Orange Fab', 'University', 'ODC Club', 'Online'].map(v => (
                    <span key={v} className="px-2 py-0.5 bg-emerald-50 text-[9px] font-bold text-emerald-600 rounded-md border border-emerald-100">{v}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-6 text-xs text-gray-400 leading-relaxed italic">
              Le système tente de normaliser vos données (ex: "étudiant" devient "student / pupil"), mais il est préférable d'utiliser les termes exacts ci-dessus.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl bg-orange-50/30 border-orange-100">
            <h4 className="text-xs font-black uppercase text-odc-orange mb-2">Conseil</h4>
            <p className="text-xs text-orange-800/70 leading-relaxed">
              Créez d’abord la formation (ou l’activité) dans <strong>École du code</strong>, puis importez la feuille ici en la liant : les effectifs inscrits / confirmés / validés de la fiche se mettent à jour après l’import.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-card p-10 rounded-[32px]">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  <Link2 className="w-3.5 h-3.5" />
                  Activité cible (recommandé)
                  {mustPickActivity && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={formationId}
                  onChange={(e) => {
                    setFormationId(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-odc-orange"
                  disabled={loadingFormations}
                >
                  <option value="">{loadingFormations ? 'Chargement…' : mustPickActivity ? '— Choisir une activité —' : '(Optionnel) Correspondance par nom de formation'}</option>
                  {formations.map((f) => {
                    const type = ACTIVITY_LABELS[f.activityType] || 'Formation';
                    const d = f.dateStart ? new Date(f.dateStart).toLocaleDateString('fr-FR') : '—';
                    return (
                      <option key={f._id} value={f._id}>
                        {f.title} · {type} · {d}
                      </option>
                    );
                  })}
                </select>
                {mustPickActivity && (
                  <p className="mt-2 text-xs text-gray-500">
                    Obligatoire pour les comptes liés à votre entité.
                  </p>
                )}
              </div>

              <div
                className={`border-2 border-dashed rounded-[24px] p-12 text-center transition-all ${
                  file ? 'border-odc-orange bg-orange-50/20' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <div
                    className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center transition-transform ${file ? 'bg-odc-orange text-white scale-110' : 'bg-white text-gray-400 border border-gray-100 shadow-sm'}`}
                  >
                    {file ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {file ? file.name : 'Cliquez ou glissez un fichier'}
                  </h3>
                  <p className="text-sm text-gray-500">Excel (.xlsx) ou CSV jusqu'à 5MB</p>
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              {result && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100 animate-in zoom-in-95">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  Importation : {result.data?.imported ?? 0} ligne(s) traitée(s).
                  {result.data?.formationId && " Les compteurs de l'activité sélectionnée ont été recalculés."}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !file || (mustPickActivity && !formationId)}
                  className="premium-gradient px-8 py-4 rounded-xl text-white font-black uppercase tracking-widest text-sm hover:translate-y-[-2px] active:translate-y-[0] transition-all shadow-[0_15px_30px_-10px_rgba(255,121,0,0.3)] disabled:opacity-50 disabled:translate-y-0"
                >
                  {loading ? 'Traitement en cours...' : 'Lancer l\'importation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
