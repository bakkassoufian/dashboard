import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

const STATUS_OPTIONS = [
  { value: 'en_cours_production', label: 'En cours de production' },
  { value: 'en_cours_validation', label: 'En cours de validation' },
  { value: 'valide_programme', label: 'Validé / Programmé' },
  { value: 'publie', label: 'Publié' },
];

export default function FormationsCom() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set('status', filterStatus);
    api.get(`/formations?${params}`)
      .then((r) => setFormations(r.data || []))
      .catch(() => setFormations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/formations/${id}`, { status });
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const updateRecommendedDate = async (id, date) => {
    try {
      await api.patch(`/formations/${id}`, { publicationDateRecommended: date || null });
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-odc-black uppercase tracking-wide">Workflow Com\' — Publication</h1>
      <p className="text-gray-600 text-sm">Validez les demandes de publication et définissez les dates recommandées.</p>

      <div className="bg-white rounded-odc shadow p-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Filtrer par statut</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-odc px-3 py-2 text-sm w-56"
          >
            <option value="">Tous</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-odc shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-odc-black text-white">
                <tr>
                  <th className="text-left px-4 py-3">Formation</th>
                  <th className="text-left px-4 py-3">Formateur</th>
                  <th className="text-left px-4 py-3">Ville</th>
                  <th className="text-left px-4 py-3">Date demandée</th>
                  <th className="text-left px-4 py-3">Date recommandée</th>
                  <th className="text-left px-4 py-3">Statut</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {formations.map((f) => (
                  <tr key={f._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{f.title}</td>
                    <td className="px-4 py-3">{f.trainerName ?? '—'}</td>
                    <td className="px-4 py-3">{f.location ?? f.entityId?.location ?? '—'}</td>
                    <td className="px-4 py-3">{f.publicationDateRequested ? new Date(f.publicationDateRequested).toLocaleDateString('fr-FR') : '—'}</td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={f.publicationDateRecommended ? new Date(f.publicationDateRecommended).toISOString().slice(0, 10) : ''}
                        onChange={(e) => updateRecommendedDate(f._id, e.target.value ? new Date(e.target.value).toISOString() : null)}
                        className="border border-gray-300 rounded-odc px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={f.status}
                        onChange={(e) => updateStatus(f._id, e.target.value)}
                        className="border border-gray-300 rounded-odc px-2 py-1 text-sm"
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {f.registrationLink && (
                        <a href={f.registrationLink} target="_blank" rel="noopener noreferrer" className="text-odc-orange hover:underline text-sm">Lien</a>
                      )}
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
