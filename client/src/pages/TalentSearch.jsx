import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ExternalLink } from 'lucide-react';

export default function TalentSearch() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    specialty: '',
    educationLevel: '',
    recommendedForJobDating: 'true',
  });

  const search = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.specialty) params.set('specialty', filters.specialty);
    if (filters.educationLevel) params.set('educationLevel', filters.educationLevel);
    if (filters.recommendedForJobDating) params.set('recommendedForJobDating', filters.recommendedForJobDating);
    api.get(`/participants?${params}&limit=100`)
      .then((r) => setParticipants(r.data || []))
      .catch(() => setParticipants([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    search();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-odc-black uppercase tracking-wide">Talent Search</h1>
      <p className="text-gray-600 text-sm">Recherchez les profils recommandés pour le Job Dating (LinkedIn, CV).</p>

      <div className="bg-white rounded-odc shadow p-4 flex flex-wrap gap-4 items-end">
        <input
          type="text"
          placeholder="Spécialité (ex: DevOps, Full-Stack...)"
          value={filters.specialty}
          onChange={(e) => setFilters((f) => ({ ...f, specialty: e.target.value }))}
          className="border border-gray-300 rounded-odc px-3 py-2 text-sm w-56"
        />
        <input
          type="text"
          placeholder="Niveau (Bac+2, Bac+5...)"
          value={filters.educationLevel}
          onChange={(e) => setFilters((f) => ({ ...f, educationLevel: e.target.value }))}
          className="border border-gray-300 rounded-odc px-3 py-2 text-sm w-40"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.recommendedForJobDating === 'true'}
            onChange={(e) => setFilters((f) => ({ ...f, recommendedForJobDating: e.target.checked ? 'true' : '' }))}
            className="rounded border-gray-300 text-odc-orange"
          />
          <span className="text-sm">Recommandés Job Dating uniquement</span>
        </label>
        <button
          type="button"
          onClick={search}
          disabled={loading}
          className="px-4 py-2 bg-odc-orange text-white font-medium rounded-odc hover:bg-[#e66d00] disabled:opacity-50"
        >
          {loading ? 'Recherche...' : 'Rechercher'}
        </button>
      </div>

      <div className="bg-white rounded-odc shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-odc-black text-white">
                <tr>
                  <th className="text-left px-4 py-3">Nom</th>
                  <th className="text-left px-4 py-3">Spécialité</th>
                  <th className="text-left px-4 py-3">Niveau</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">LinkedIn / CV</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{[p.firstName, p.lastName].filter(Boolean).join(' ') || '—'}</td>
                    <td className="px-4 py-3">{p.specialty ?? '—'}</td>
                    <td className="px-4 py-3">{p.educationLevel ?? '—'}</td>
                    <td className="px-4 py-3">{p.email ?? '—'}</td>
                    <td className="px-4 py-3 flex gap-2">
                      {p.linkedIn && (
                        <a href={p.linkedIn} target="_blank" rel="noopener noreferrer" className="text-odc-orange hover:underline inline-flex items-center gap-1">
                          <ExternalLink className="w-4 h-4" /> LinkedIn
                        </a>
                      )}
                      {p.cvLink && (
                        <a href={p.cvLink} target="_blank" rel="noopener noreferrer" className="text-odc-orange hover:underline inline-flex items-center gap-1">
                          <ExternalLink className="w-4 h-4" /> CV
                        </a>
                      )}
                      {!p.linkedIn && !p.cvLink && '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-2 bg-gray-50 text-gray-600 text-sm">
          {participants.length} profil(s) trouvé(s)
        </div>
      </div>
    </div>
  );
}
