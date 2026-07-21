import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { LayoutGrid, ExternalLink, Plus, X, Globe, Users } from 'lucide-react';

const STATUS_META = {
  live: { label: 'En ligne', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  beta: { label: 'Bêta', cls: 'bg-sky-50 text-sky-600 border-sky-100' },
  development: { label: 'En développement', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
  archived: { label: 'Archivé', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const CATEGORIES = ['Formation', 'Entrepreneuriat', 'Employabilité', 'Communauté', 'Outil interne', 'Autre'];

const EMPTY_FORM = {
  name: '',
  description: '',
  url: '',
  category: 'Autre',
  status: 'live',
  tags: '',
  launchYear: '',
};

export default function Platforms() {
  const { user } = useAuth();
  const canManage = ['super_admin', 'manager', 'coordinator'].includes(user?.role);

  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/platforms')
      .then((res) => setPlatforms(res.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (categoryFilter === 'all' ? platforms : platforms.filter((p) => p.category === categoryFilter)),
    [platforms, categoryFilter],
  );

  const liveCount = useMemo(() => platforms.filter((p) => p.status === 'live').length, [platforms]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        launchYear: form.launchYear ? Number(form.launchYear) : undefined,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      await api.post('/platforms', payload);
      setShowAdd(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Nos Plateformes"
          description="L'ensemble des plateformes et outils digitaux conçus par Orange Digital Center."
          badge="Écosystème digital"
        />
        {canManage && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-odc-orange text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:bg-odc-black transition-all w-fit"
          >
            <Plus className="w-4 h-4" />
            Ajouter une plateforme
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard icon={LayoutGrid} color="text-orange-600" bg="bg-orange-50" label="Plateformes" value={platforms.length} />
        <KpiCard icon={Globe} color="text-emerald-600" bg="bg-emerald-50" label="En ligne" value={liveCount} />
        <KpiCard icon={Users} color="text-indigo-600" bg="bg-indigo-50" label="Catégories" value={new Set(platforms.map((p) => p.category)).size} />
        <KpiCard icon={LayoutGrid} color="text-sky-600" bg="bg-sky-50" label="En développement" value={platforms.filter((p) => p.status === 'development').length} />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-4">
        <FilterChip active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>
          Toutes
        </FilterChip>
        {CATEGORIES.map((c) => (
          <FilterChip key={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)}>
            {c}
          </FilterChip>
        ))}
      </div>

      {error && <p className="text-sm text-rose-600 font-medium pt-2">{error}</p>}

      {loading ? (
        <p className="text-gray-400 text-sm pt-6">Chargement des plateformes...</p>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-[32px] border border-gray-100 bg-white p-12 text-center mt-6">
          <LayoutGrid className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucune plateforme dans cette catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {filtered.map((p) => {
            const meta = STATUS_META[p.status] || STATUS_META.live;
            const hasLink = p.url && p.url !== '#';
            return (
              <div key={p._id} className="glass-card rounded-[28px] border border-gray-100 bg-white p-6 hover:shadow-lg transition-all flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-odc-orange overflow-hidden">
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <LayoutGrid className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full border ${meta.cls}`}>
                    {meta.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-odc-black">{p.name}</h3>
                  {p.launchYear && <span className="text-[10px] font-bold text-gray-400">· {p.launchYear}</span>}
                </div>
                <p className="text-[10px] font-bold text-odc-orange uppercase tracking-[0.15em] mt-0.5">{p.category}</p>
                {p.description && (
                  <p className="text-sm text-gray-500 leading-relaxed mt-3 line-clamp-3">{p.description}</p>
                )}
                {p.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {p.tags.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 bg-gray-50 text-[10px] font-bold text-gray-500 rounded-lg border border-gray-100">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-auto pt-5">
                  {hasLink ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-odc-orange hover:text-odc-black transition-colors"
                    >
                      Visiter la plateforme <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-gray-300">
                      Lien à venir
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl relative">
            <button onClick={() => setShowAdd(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-odc-black mb-6">Nouvelle plateforme</h3>
            <form onSubmit={handleAdd} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <Field label="Nom" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <div>
                <Label>Description</Label>
                <textarea
                  rows="3"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all resize-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <Field label="URL" placeholder="https://..." value={form.url} onChange={(v) => setForm({ ...form, url: v })} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Catégorie</Label>
                  <select
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Statut</Label>
                  <select
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="live">En ligne</option>
                    <option value="beta">Bêta</option>
                    <option value="development">En développement</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Année de lancement" type="number" placeholder="2026" value={form.launchYear} onChange={(v) => setForm({ ...form, launchYear: v })} />
                <Field label="Tags (virgules)" placeholder="KPI, Analytics" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-8 py-3 bg-odc-orange text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-odc-black transition-all disabled:opacity-60">
                  {saving ? 'Enregistrement...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, color, bg, label, value }) {
  return (
    <div className="glass-card p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-all">
      <div className={`p-3 w-fit rounded-xl mb-4 ${bg} ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
        active
          ? 'bg-odc-orange text-white border-odc-orange shadow-sm'
          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}

function Label({ children }) {
  return <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{children}</label>;
}

function Field({ label, value, onChange, type = 'text', required, placeholder }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
