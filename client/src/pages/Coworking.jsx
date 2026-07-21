import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Building2,
  Users,
  MapPin,
  Clock,
  Plus,
  X,
  Armchair,
  CheckCircle2,
} from 'lucide-react';

const STATUS_META = {
  open: { label: 'Ouvert', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  full: { label: 'Complet', cls: 'bg-rose-50 text-rose-600 border-rose-100' },
  maintenance: { label: 'Maintenance', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
  closed: { label: 'Fermé', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const EMPTY_FORM = {
  name: '',
  city: '',
  location: '',
  description: '',
  capacity: '',
  occupied: '',
  openingHours: '09h00 - 18h00',
  status: 'open',
  amenities: '',
};

export default function Coworking() {
  const { user } = useAuth();
  const canManage = ['super_admin', 'manager', 'coordinator', 'member'].includes(user?.role);

  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/coworking')
      .then((res) => setSpaces(res.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const kpis = useMemo(() => {
    const totalCapacity = spaces.reduce((s, x) => s + (x.capacity || 0), 0);
    const totalOccupied = spaces.reduce((s, x) => s + (x.occupied || 0), 0);
    const openCount = spaces.filter((x) => x.status === 'open').length;
    const rate = totalCapacity ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
    return { totalCapacity, totalOccupied, openCount, rate };
  }, [spaces]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity) || 0,
        occupied: Number(form.occupied) || 0,
        amenities: form.amenities
          ? form.amenities.split(',').map((a) => a.trim()).filter(Boolean)
          : [],
      };
      await api.post('/coworking', payload);
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
          title="Espaces de Coworking"
          description="Espaces collaboratifs ODC : capacité, disponibilité et services pour les startups et communautés."
          badge="Coworking"
        />
        {canManage && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-odc-orange text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:bg-odc-black transition-all w-fit"
          >
            <Plus className="w-4 h-4" />
            Ajouter un espace
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard icon={Building2} color="text-orange-600" bg="bg-orange-50" label="Espaces" value={spaces.length} />
        <KpiCard icon={Armchair} color="text-indigo-600" bg="bg-indigo-50" label="Capacité totale" value={kpis.totalCapacity} />
        <KpiCard icon={Users} color="text-emerald-600" bg="bg-emerald-50" label="Postes occupés" value={kpis.totalOccupied} />
        <KpiCard icon={CheckCircle2} color="text-rose-600" bg="bg-rose-50" label="Taux d'occupation" value={`${kpis.rate}%`} />
      </div>

      {error && <p className="text-sm text-rose-600 font-medium pt-2">{error}</p>}

      {loading ? (
        <p className="text-gray-400 text-sm pt-6">Chargement des espaces...</p>
      ) : spaces.length === 0 ? (
        <div className="glass-card rounded-[32px] border border-gray-100 bg-white p-12 text-center mt-6">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucun espace de coworking pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {spaces.map((sp) => {
            const meta = STATUS_META[sp.status] || STATUS_META.open;
            const rate = sp.capacity ? Math.round(((sp.occupied || 0) / sp.capacity) * 100) : 0;
            return (
              <div key={sp._id} className="glass-card rounded-[28px] border border-gray-100 bg-white p-6 hover:shadow-lg transition-all flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-odc-orange">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full border ${meta.cls}`}>
                    {meta.label}
                  </span>
                </div>
                <h3 className="text-lg font-black text-odc-black">{sp.name}</h3>
                {(sp.city || sp.location) && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {sp.location || sp.city}
                  </p>
                )}
                {sp.description && (
                  <p className="text-sm text-gray-500 leading-relaxed mt-3 line-clamp-3">{sp.description}</p>
                )}

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    <span>Occupation</span>
                    <span>{sp.occupied || 0}/{sp.capacity || 0}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${rate >= 100 ? 'bg-rose-400' : 'bg-odc-orange'}`}
                      style={{ width: `${Math.min(rate, 100)}%` }}
                    />
                  </div>
                </div>

                {sp.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {sp.amenities.map((a, i) => (
                      <span key={i} className="px-2.5 py-1 bg-gray-50 text-[10px] font-bold text-gray-500 rounded-lg border border-gray-100">
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-gray-400 font-medium">
                  <Clock className="w-3.5 h-3.5" /> {sp.openingHours || '—'}
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
            <h3 className="text-2xl font-black text-odc-black mb-6">Nouvel espace de coworking</h3>
            <form onSubmit={handleAdd} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <Field label="Nom de l'espace" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ville" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <Field label="Horaires" value={form.openingHours} onChange={(v) => setForm({ ...form, openingHours: v })} />
              </div>
              <Field label="Localisation (adresse / salle)" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
              <div>
                <Label>Description</Label>
                <textarea
                  rows="3"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all resize-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Capacité" type="number" value={form.capacity} onChange={(v) => setForm({ ...form, capacity: v })} />
                <Field label="Postes occupés" type="number" value={form.occupied} onChange={(v) => setForm({ ...form, occupied: v })} />
              </div>
              <div>
                <Label>Statut</Label>
                <select
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="open">Ouvert</option>
                  <option value="full">Complet</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="closed">Fermé</option>
                </select>
              </div>
              <Field
                label="Services (séparés par des virgules)"
                placeholder="Wi-Fi fibre, Salles de réunion, Café"
                value={form.amenities}
                onChange={(v) => setForm({ ...form, amenities: v })}
              />
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
