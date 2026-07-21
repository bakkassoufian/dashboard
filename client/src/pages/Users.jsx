import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';
import { Mail, Plus, ExternalLink, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

const ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'coordinator', label: 'Coordinateur' },
  { value: 'rse_manager', label: 'RSE Manager' },
  { value: 'member', label: 'Membre / Formateur' },
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Notification State
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

  // New User Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'member',
    entityId: ''
  });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchUsers = () => {
    Promise.all([api.get('/users'), api.get('/entities')])
      .then(([u, e]) => {
        setUsers(u.data || []);
        setEntities(e.data || []);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUser = async (userId, payload) => {
    try {
      await api.patch(`/users/${userId}`, payload);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, ...payload } : u)));
      showNotification('success', 'Rôle ou affectation mis à jour aves succès.');
    } catch (e) {
      showNotification('error', e.message || 'Erreur lors de la modification');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setPreviewUrl(null);
    try {
      const res = await api.post('/users', formData);
      setUsers([res.data, ...users]); // Prepend new user
      if (res.previewUrl) {
        setPreviewUrl(res.previewUrl);
      } else {
        showNotification('success', 'Utilisateur créé et email envoyé avec succès.');
      }
      setFormData({ firstName: '', lastName: '', email: '', role: 'member', entityId: '' });
      setShowAddForm(false);
    } catch (err) {
      showNotification('error', err.message || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500/90 text-white border-green-400' 
            : 'bg-red-500/90 text-white border-red-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold text-sm tracking-wide">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-4 hover:opacity-75 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader 
          title="Gestion des Utilisateurs" 
          description="Administration des accès, des rôles et des entités de l'écosystème ODC"
        />
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-odc-orange text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          {showAddForm ? 'Fermer' : <><Plus className="w-5 h-5" /> Nouvel Utilisateur</>}
        </button>
      </div>

      {previewUrl && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-green-800">Utilisateur ajouté avec succès !</h4>
            <p className="text-xs text-green-700 mt-1">Les identifiants générés ont été envoyés par email.</p>
          </div>
          <a href={previewUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-900 bg-green-100 px-4 py-2 rounded-lg transition-colors">
            <Mail className="w-4 h-4" /> Voir l'email <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleCreateUser} className="glass-card p-8 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 bg-odc-orange h-full" />
          <h3 className="col-span-full text-lg font-black mb-2">Ajouter un collaborateur</h3>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Prénom</label>
            <input required type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-odc-orange transition-shadow" placeholder="Ali" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nom</label>
            <input required type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-odc-orange transition-shadow" placeholder="Benjelloun" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Automatique</label>
            <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-odc-orange transition-shadow" placeholder="ali.benjelloun@odc.ma" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rôle assigné</label>
            <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-odc-orange transition-shadow">
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          {formData.role === 'member' && (
            <div className="col-span-full">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Entité d'affectation</label>
              <select value={formData.entityId} onChange={(e) => setFormData({...formData, entityId: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-odc-orange transition-shadow">
                <option value="">Sélectionnez une entité...</option>
                {entities.map(e => <option key={e._id} value={e._id}>{e.name} ({e.location})</option>)}
              </select>
            </div>
          )}
          <div className="col-span-full text-right mt-4">
            <button disabled={creating} type="submit" className="bg-odc-black text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 ml-auto hover:bg-gray-800 transition-colors disabled:opacity-50">
              {creating ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi...</> : <><Mail className="w-5 h-5" /> Ajouter & Envoyer Email</>}
            </button>
          </div>
        </form>
      )}

      <div className="glass-card overflow-hidden rounded-[24px]">
        {loading ? <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Chargement...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500">Employé</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500">Rôle</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500">Entité (Si Membre)</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{u.email}</td>
                    <td className="px-6 py-4 font-bold">{[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}</td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => updateUser(u._id, { role: e.target.value })}
                        className="bg-transparent font-bold text-gray-700 outline-none focus:ring-0 cursor-pointer"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.entityId?._id ?? ''}
                        onChange={(e) => updateUser(u._id, { entityId: e.target.value || null })}
                        className="bg-transparent outline-none focus:ring-0 cursor-pointer text-gray-600 w-full"
                      >
                        <option value="">— Toutes —</option>
                        {entities.map((ent) => (
                          <option key={ent._id} value={ent._id}>{ent.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={u.isActive !== false}
                          onChange={(e) => updateUser(u._id, { isActive: e.target.checked })}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
