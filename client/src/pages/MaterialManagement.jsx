import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { 
  Package, 
  Plus, 
  FileUp, 
  AlertCircle, 
  CheckCircle2, 
  Wrench, 
  BarChart3,
  Search,
  Filter
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

export default function MaterialManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: '', category: 'Impression 3D', status: 'Opérationnel', location: 'Lab A' });
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Imprimante 3D Ultimaker S5', category: 'Impression 3D', status: 'Opérationnel', location: 'Lab A', lastMaintenance: '2026-03-15' },
    { id: 2, name: 'Découpeuse Laser Epilog', category: 'Découpe Laser', status: 'Maintenance', location: 'Lab B', lastMaintenance: '2026-04-10' },
    { id: 3, name: 'Fraiseuse CNC Roland', category: 'Fraisage', status: 'Opérationnel', location: 'Lab A', lastMaintenance: '2026-02-20' },
    { id: 4, name: 'Oscilloscope Rigol', category: 'Électronique', status: 'Opérationnel', location: 'Lab C', lastMaintenance: '2026-01-10' },
    { id: 5, name: 'Imprimante 3D Formlabs 3', category: 'Impression 3D', status: 'En réparation', location: 'Lab A', lastMaintenance: '2026-04-05' },
  ]);

  const handleAddMaterial = (e) => {
    e.preventDefault();
    const id = inventory.length + 1;
    const date = new Date().toISOString().split('T')[0];
    setInventory([...inventory, { ...newMaterial, id, lastMaintenance: date }]);
    setShowAddModal(false);
    setNewMaterial({ name: '', category: 'Impression 3D', status: 'Opérationnel', location: 'Lab A' });
  };

  const stats = [
    { label: 'Total Équipements', value: inventory.length, icon: Package, color: 'text-odc-orange', bg: 'bg-orange-50' },
    { label: 'Opérationnels', value: inventory.filter(i => i.status === 'Opérationnel').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'En Maintenance', value: inventory.filter(i => i.status === 'Maintenance' || i.status === 'En réparation').length, icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Alertes Stock', value: '2', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const chartData = [
    { name: 'Impression 3D', count: inventory.filter(i => i.category === 'Impression 3D').length },
    { name: 'Découpe Laser', count: inventory.filter(i => i.category === 'Découpe Laser').length },
    { name: 'Fraisage', count: inventory.filter(i => i.category === 'Fraisage').length },
    { name: 'Électronique', count: inventory.filter(i => i.category === 'Électronique').length },
  ];

  const statusData = [
    { name: 'Opérationnel', value: inventory.filter(i => i.status === 'Opérationnel').length, color: '#10B981' },
    { name: 'Maintenance', value: inventory.filter(i => i.status === 'Maintenance').length, color: '#F59E0B' },
    { name: 'Réparation', value: inventory.filter(i => i.status === 'En réparation').length, color: '#EF4444' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Gestion du Matériel" 
          description="Inventaire, maintenance et suivi technique des équipements du FabLab."
          badge="FabLab"
        />
        <div className="flex gap-3">
          <button 
            onClick={() => alert('Fonctionnalité d\'importation bientôt disponible (CSV/Excel)')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            <FileUp className="w-4 h-4" />
            Importer
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-odc-orange text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:bg-odc-black transition-all"
          >
            <Plus className="w-4 h-4" />
            Ajouter matériel
          </button>
        </div>
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-odc-black mb-6">Nouveau Matériel</h3>
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nom de l'équipement</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-odc-orange/10 focus:border-odc-orange"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Catégorie</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-odc-orange/10 focus:border-odc-orange"
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial({...newMaterial, category: e.target.value})}
                  >
                    <option>Impression 3D</option>
                    <option>Découpe Laser</option>
                    <option>Fraisage</option>
                    <option>Électronique</option>
                    <option>Outillage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Localisation</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-odc-orange/10 focus:border-odc-orange"
                    value={newMaterial.location}
                    onChange={(e) => setNewMaterial({...newMaterial, location: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-2 px-8 py-3 bg-odc-orange text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-odc-black transition-all"
                >
                  Ajouter l'équipement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 bg-white">
            <div className={`p-3 w-fit rounded-xl mb-4 ${s.bg} ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <p className="text-gray-500 text-sm font-medium">{s.label}</p>
            <h3 className="text-2xl font-bold mt-1 text-odc-black">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory Table */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-lg text-odc-black">Liste des équipements</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher..."
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-odc-orange w-full md:w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">Matériel</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4">Localisation</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Dernière Maintenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-gray-900">{item.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">{item.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">{item.location}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'Opérationnel' ? 'bg-emerald-50 text-emerald-600' :
                        item.status === 'Maintenance' ? 'bg-amber-50 text-amber-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-400 font-medium">{item.lastMaintenance}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Sidebar */}
        <div className="space-y-8">
          <div className="glass-card p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Répartition par catégorie
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#FF7900" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
               État du parc
            </h3>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-odc-black">80%</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Dispo</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {statusData.map((s, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-gray-500 font-medium">{s.name}</span>
                  </div>
                  <span className="font-bold text-odc-black">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
