import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { api } from '../api/client';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  manager: 'Manager',
  coordinator: 'Coordinateur',
  member: 'Membre / Formateur',
};

function TagInput({ label, placeholder, tags, onAdd, onRemove, helper }) {
  const [value, setValue] = useState('');

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    onAdd(v);
    setValue('');
  };

  return (
    <div>
      <label className="block text-xs uppercase text-gray-500 mb-1">{label}</label>
      <div className="w-full min-h-[108px] border border-gray-300 rounded-xl p-3 bg-white flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-odc-orange/10 text-odc-black text-xs font-semibold">
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="text-gray-500 hover:text-red-500"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          className="min-w-[180px] flex-1 outline-none text-sm"
        />
      </div>
      {helper && <p className="mt-1 text-xs text-gray-400">{helper}</p>}
    </div>
  );
}

export default function AdminPanel() {
  const [permissions, setPermissions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({ centers: [], periods: [] });
  const [statsScope, setStatsScope] = useState({ location: 'Global', activity: 'All' });
  const [currentStats, setCurrentStats] = useState({});
  const [statsDelta, setStatsDelta] = useState({
    totalParticipants: 0,
    womenBeneficiaries: 0,
    totalTrainings: 0,
    totalStartups: 0,
    insertionRate: 0,
    childrenSuperCodeur: 0,
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const periodToTag = (p) => `${p.key}:${p.label}:${p.enabled ? '1' : '0'}`;
  const parsePeriodTag = (tag) => {
    const [key = '', label = '', enabled = '1'] = String(tag).split(':');
    return {
      key: key.trim(),
      label: label.trim() || key.trim(),
      enabled: enabled.trim() !== '0',
    };
  };

  const loadAll = async () => {
    setLoading(true);
    setMsg('');
    try {
      const { location, activity } = statsScope;
      const [p, l, s, statsRes] = await Promise.all([
        api.get('/admin/permissions'),
        api.get('/admin/logs?limit=50'),
        api.get('/admin/settings'),
        api.get(`/admin/stats?location=${location}&activity=${activity}`),
      ]);
      setPermissions(p.data || []);
      setLogs(l.data || []);
      setSettings(s.data || { centers: [], periods: [] });
      setCurrentStats(statsRes.data || {});
    } catch (e) {
      setMsg(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [statsScope]);

  const updatePermission = async (role, key, value) => {
    const next = permissions.map((r) => (
      r.role === role ? { ...r, permissions: { ...r.permissions, [key]: value } } : r
    ));
    setPermissions(next);
    try {
      const found = next.find((r) => r.role === role);
      await api.put(`/admin/permissions/${role}`, { permissions: found.permissions });
      setMsg('Permissions mises à jour.');
    } catch (e) {
      setMsg(e.message || 'Erreur permission');
    }
  };

  const saveSettings = async () => {
    try {
      await api.put('/admin/settings', settings);
      setMsg('Paramètres globaux enregistrés.');
    } catch (e) {
      setMsg(e.message || 'Erreur paramètres');
    }
  };

  const saveStats = async () => {
    try {
      await api.put('/admin/stats', { ...statsScope, ...statsDelta });
      setMsg('Chiffres incrémentés pour cette catégorie.');
      setStatsDelta({
        totalParticipants: 0,
        womenBeneficiaries: 0,
        totalTrainings: 0,
        totalStartups: 0,
        insertionRate: 0,
        childrenSuperCodeur: 0,
      });
      loadAll(); // Reload to show new current values
    } catch (e) {
      setMsg(e.message || 'Erreur stats');
    }
  };

  const resetStats = async () => {
    if (!window.confirm('Voulez-vous vraiment réinitialiser TOUTES les données manuelles du dashboard ? Cette action est irréversible.')) return;
    try {
      await api.delete('/admin/stats/reset');
      setMsg('Toutes les données ont été réinitialisées à 0.');
      loadAll();
    } catch (e) {
      setMsg(e.message || 'Erreur reset');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Chargement admin panel...</div>;

  return (
    <div className="space-y-8">
      <PageHeader title="Admin Panel" description="Gestion des permissions, logs d'activité et paramètres globaux." />
      {msg && <div className="bg-odc-orange/10 text-odc-black border border-odc-orange/30 rounded-xl px-4 py-2 text-sm">{msg}</div>}

      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-lg font-bold text-odc-black mb-4">Permissions (read / write / export / delete)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Rôle</th>
                <th className="text-left px-3 py-2">Read</th>
                <th className="text-left px-3 py-2">Write</th>
                <th className="text-left px-3 py-2">Export</th>
                <th className="text-left px-3 py-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((r) => (
                <tr key={r.role} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-semibold">{ROLE_LABELS[r.role] || r.role}</td>
                  {['read', 'write', 'export', 'delete'].map((k) => (
                    <td key={k} className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={!!r.permissions?.[k]}
                        onChange={(e) => updatePermission(r.role, k, e.target.checked)}
                        className="w-4 h-4 accent-[#FF7900]"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-lg font-bold text-odc-black mb-4">Platform Settings (entities / centers / periods)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TagInput
            label="Centers"
            placeholder="Type a center and press Enter"
            tags={settings.centers || []}
            onAdd={(v) => setSettings((s) => ({ ...s, centers: [...new Set([...(s.centers || []), v])] }))}
            onRemove={(v) => setSettings((s) => ({ ...s, centers: (s.centers || []).filter((x) => x !== v) }))}
          />
          <TagInput
            label="Periods"
            placeholder="Format: key:label:enabled then Enter"
            helper="Example: month:Mois:1 or semester:Semestre:0"
            tags={(settings.periods || []).map(periodToTag)}
            onAdd={(tag) => {
              const parsed = parsePeriodTag(tag);
              if (!parsed.key) return;
              setSettings((s) => {
                const next = [...(s.periods || [])];
                const idx = next.findIndex((p) => p.key === parsed.key);
                if (idx >= 0) next[idx] = parsed;
                else next.push(parsed);
                return { ...s, periods: next };
              });
            }}
            onRemove={(tag) => {
              const parsed = parsePeriodTag(tag);
              setSettings((s) => ({ ...s, periods: (s.periods || []).filter((p) => p.key !== parsed.key) }));
            }}
          />
        </div>
        <button type="button" onClick={saveSettings} className="mt-4 px-4 py-2 rounded-lg bg-odc-orange text-white font-semibold">
          Enregistrer paramètres
        </button>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-lg font-bold text-odc-black mb-4">Chiffres du Dashboard Manager</h2>
        <p className="text-sm text-gray-500 mb-6">Ajoutez des chiffres pour une entité spécifique. Les valeurs saisies seront <strong>ajoutées</strong> aux totaux existants.</p>
        
        {/* Scope Selection */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
           <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Ville / Location</label>
              <select 
                value={statsScope.location}
                onChange={(e) => setStatsScope(s => ({...s, location: e.target.value}))}
                className="w-full p-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-odc-orange outline-none font-bold"
              >
                  <option value="Global">Global / National</option>
                  <option value="Casablanca">Casablanca</option>
                  <option value="Rabat">Rabat</option>
                  <option value="Agadir">Agadir</option>
              </select>
           </div>
           <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Activité / Entité</label>
              <select 
                value={statsScope.activity}
                onChange={(e) => setStatsScope(s => ({...s, activity: e.target.value}))}
                className="w-full p-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-odc-orange outline-none font-bold"
              >
                  <option value="All">Toutes les activités</option>
                  <option value="Ecole du Code">École du Code</option>
                  <option value="FabLab Solidaire">FabLab Solidaire</option>
                  <option value="Orange Fab">Orange Fab</option>
              </select>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { key: 'totalParticipants', label: 'Total Participants' },
            { key: 'womenBeneficiaries', label: 'Femmes Bénéficiaires' },
            { key: 'totalTrainings', label: 'Formations Délivrées' },
            { key: 'totalStartups', label: 'Startups Accompagnées' },
            { key: 'insertionRate', label: 'Taux d\'insertion (%)' },
            { key: 'childrenSuperCodeur', label: 'Enfants Super Codeur' },
          ].map(field => (
            <div key={field.key} className="space-y-1 bg-white p-4 rounded-2xl border border-gray-50 flex flex-col">
               <label className="text-[10px] font-black uppercase text-gray-400">{field.label}</label>
               <div className="mt-2 text-2xl font-black text-gray-400 mb-2">
                 {currentStats[field.key] || 0}
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-odc-orange">+</span>
                  <input 
                    type="number" 
                    placeholder="Ajouter..."
                    value={statsDelta[field.key] || ''} 
                    onChange={(e) => setStatsDelta({...statsDelta, [field.key]: Number(e.target.value)})}
                    className="w-full p-2 border-b-2 border-gray-100 focus:border-odc-orange outline-none font-bold text-lg"
                  />
               </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
           <p className="text-xs text-gray-400 font-medium">
             Les changements seront appliqués à <strong>{statsScope.location}</strong> ({statsScope.activity})
           </p>
           <div className="flex gap-4">
              <button 
                type="button" 
                onClick={resetStats} 
                className="px-6 py-4 border-2 border-red-100 text-red-500 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-50 transition-all"
              >
                Réinitialiser tout (0)
              </button>
              <button 
                type="button" 
                onClick={saveStats} 
                className="px-8 py-4 bg-odc-orange text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-orange-500/20"
              >
                Incrémenter les chiffres
              </button>
           </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-lg font-bold text-odc-black mb-4">Activity Logs (who did what, when)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">When</th>
                <th className="text-left px-3 py-2">Who</th>
                <th className="text-left px-3 py-2">Role</th>
                <th className="text-left px-3 py-2">Action</th>
                <th className="text-left px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-t border-gray-100">
                  <td className="px-3 py-2">{new Date(log.createdAt).toLocaleString('fr-FR')}</td>
                  <td className="px-3 py-2">{log.actorEmail || 'system'}</td>
                  <td className="px-3 py-2">{log.actorRole || '—'}</td>
                  <td className="px-3 py-2">{log.action}</td>
                  <td className="px-3 py-2">{log.statusCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
