import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Entities() {
  const { user } = useAuth();
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', type: 'Ecole du Code', location: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const canEdit = user?.role === 'super_admin' || user?.role === 'entity_manager';

  const load = () => {
    api.get('/entities').then((r) => setEntities(r.data || [])).catch(() => setEntities([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/entities/${editingId}`, form);
        setEditingId(null);
      } else {
        await api.post('/entities', form);
      }
      setForm({ name: '', type: 'Ecole du Code', location: '', description: '' });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-odc-black uppercase tracking-wide">Entités</h1>

      {canEdit && (
        <form onSubmit={handleSubmit} className="bg-white rounded-odc shadow p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="border rounded-odc px-3 py-2 text-sm w-48" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="border rounded-odc px-3 py-2 text-sm w-56">
              <option value="Ecole du Code">École du Code</option>
              <option value="FabLab Solidaire">FabLab Solidaire</option>
              <option value="Orange Fab">Orange Fab</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Ville</label>
            <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="border rounded-odc px-3 py-2 text-sm w-32" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="border rounded-odc px-3 py-2 text-sm w-56" />
          </div>
          <button type="submit" className="px-4 py-2 bg-odc-orange text-white font-medium rounded-odc hover:bg-[#e66d00]">
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', type: 'Ecole du Code', location: '', description: '' }); }} className="px-4 py-2 border rounded-odc">Annuler</button>}
        </form>
      )}

      <div className="bg-white rounded-odc shadow overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-500">Chargement...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-odc-black text-white">
              <tr>
                <th className="text-left px-4 py-3">Nom</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Ville</th>
                <th className="text-left px-4 py-3">Description</th>
                {canEdit && <th className="text-left px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {entities.map((ent) => (
                <tr key={ent._id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium">{ent.name}</td>
                  <td className="px-4 py-3">{ent.type}</td>
                  <td className="px-4 py-3">{ent.location}</td>
                  <td className="px-4 py-3 text-gray-600">{ent.description ?? '—'}</td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => { setEditingId(ent._id); setForm({ name: ent.name, type: ent.type, location: ent.location, description: ent.description || '' }); }} className="text-odc-orange hover:underline text-sm">Modifier</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
