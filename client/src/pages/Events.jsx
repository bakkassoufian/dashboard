import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Tag, 
  ArrowRight, 
  Search,
  Trophy,
  Rocket,
  Code2,
  Cpu,
  HeartPulse,
  Plus,
  X,
  FileUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const events = [
  {
    id: 1,
    title: 'Global Innovation Week (GIW)',
    date: '15 - 20 Mai 2026',
    location: 'Technopark Casablanca',
    category: 'Innovation',
    entity: 'École du Code',
    status: 'À venir',
    description: 'Une semaine dédiée à l\'innovation technologique avec des conférences, des ateliers et des démonstrations des dernières solutions ODC.',
    participants: 1500,
    icon: Rocket,
    color: 'bg-indigo-600'
  },
  {
    id: 2,
    title: 'Orange Summer Challenge (OSC)',
    date: 'Juillet - Septembre 2026',
    location: 'ODC Rabat & Casablanca',
    category: 'Hackathon',
    entity: 'École du Code',
    status: 'Inscriptions ouvertes',
    description: 'Le grand challenge estival où les étudiants travaillent sur des solutions technologiques à fort impact social.',
    participants: 250,
    icon: Code2,
    color: 'bg-odc-orange'
  },
  {
    id: 3,
    title: 'Super Codeur 2026',
    date: '12 Juin 2026',
    location: 'National',
    category: 'Education',
    entity: 'École du Code',
    status: 'Planifié',
    description: 'Initiation au code et à la robotique pour les enfants de 9 à 13 ans à travers les clubs ODC du royaume.',
    participants: 800,
    icon: Gamepad2, // wait, Gamepad2? let's use Cpu or something
    color: 'bg-emerald-500'
  },
  {
    id: 4,
    title: 'Hello Women / Women in Tech',
    date: '08 Mars 2026',
    location: 'ODC Casablanca',
    category: 'Diversité',
    entity: 'École du Code',
    status: 'Terminé',
    description: 'Conférences et networking pour encourager la mixité dans les métiers de la tech et célébrer les réussites féminines.',
    participants: 350,
    icon: HeartPulse,
    color: 'bg-rose-500'
  },
  {
    id: 5,
    title: 'ODC Job Dating',
    date: '24 Avril 2026',
    location: 'ODC Rabat',
    category: 'Employabilité',
    entity: 'École du Code',
    status: 'Terminé',
    description: 'Mise en relation directe entre nos talents formés à l\'école du code et les entreprises partenaires qui recrutent.',
    participants: 120,
    icon: Users,
    color: 'bg-blue-600'
  },
  {
    id: 6,
    title: 'Festival National de Robotique',
    date: '10 Octobre 2026',
    location: 'FabLab Agadir',
    category: 'FabLab',
    entity: 'FabLab Solidaire',
    status: 'Planifié',
    description: 'Compétition nationale regroupant les meilleurs projets hardware et robotique développés dans nos FabLabs.',
    participants: 400,
    icon: Cpu,
    color: 'bg-amber-500'
  }
];

function extractYearFromDateLabel(dateLabel = '') {
  const match = String(dateLabel).match(/\b(20\d{2})\b/);
  return match ? match[1] : '';
}

function Gamepad2(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <rect width="20" height="12" x="2" y="6" rx="2" />
    </svg>
  );
}

export default function Events() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    date: '', 
    location: '', 
    category: 'Événement',
    description: '',
    registrationLink: '',
    imageUrl: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    city: '',
    entity: '',
    type: '',
  });

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
    const eventYear = extractYearFromDateLabel(e.date);
    const matchesYear = !filters.year || eventYear === filters.year;
    const matchesCity = !filters.city || e.location.toLowerCase().includes(filters.city.toLowerCase());
    const matchesEntity = !filters.entity || e.entity === filters.entity;
    const matchesType = !filters.type || e.category === filters.type;
    return matchesSearch && matchesYear && matchesCity && matchesEntity && matchesType;
  });

  const canCreateEvent = Boolean(user?.role) && user.role !== 'manager';

  return (
    <div className="space-y-2 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Événements ODC" 
          subtitle="Découvrez et gérez les grands rendez-vous de l'écosystème Orange Digital Center Maroc."
          badge="Calendrier"
        />
        {canCreateEvent && (
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/import')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
            >
              <FileUp className="w-4 h-4" />
              Importer
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-odc-orange text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:bg-odc-black transition-all"
            >
              <Plus className="w-4 h-4" />
              Créer un événement
            </button>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-odc-black mb-6">Nouvel Événement</h3>
            <form onSubmit={(e) => { e.preventDefault(); alert('Événement créé avec succès !'); setShowAddModal(false); }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nom de l'événement</label>
                <input type="text" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date</label>
                  <input type="date" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Lieu</label>
                  <input type="text" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Lien d'inscription</label>
                <input type="url" placeholder="https://..." className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all" value={newEvent.registrationLink} onChange={(e) => setNewEvent({...newEvent, registrationLink: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <textarea rows="3" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all resize-none" value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Image URL</label>
                <input type="url" placeholder="https://..." className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-odc-orange transition-all" value={newEvent.imageUrl} onChange={(e) => setNewEvent({...newEvent, imageUrl: e.target.value})} />
                {newEvent.imageUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden h-32 border border-gray-100">
                    <img src={newEvent.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">Annuler</button>
                <button type="submit" className="flex-2 px-8 py-3 bg-odc-orange text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-odc-black transition-all">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher un événement (ex: GIW, OSC...)" 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-odc-orange focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={filters.year}
            onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
            className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600"
          >
            <option value="">Toutes les années</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <select
            value={filters.city}
            onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
            className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600"
          >
            <option value="">Toutes les villes</option>
            <option value="Casablanca">Casablanca</option>
            <option value="Rabat">Rabat</option>
            <option value="Agadir">Agadir</option>
            <option value="National">National</option>
          </select>
          <select
            value={filters.entity}
            onChange={(e) => setFilters((f) => ({ ...f, entity: e.target.value }))}
            className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600"
          >
            <option value="">Toutes les entités</option>
            <option value="École du Code">École du Code</option>
            <option value="FabLab Solidaire">FabLab Solidaire</option>
            <option value="Orange Fab">Orange Fab</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600"
          >
            <option value="">Tous les types</option>
            <option value="Innovation">Innovation</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Education">Education</option>
            <option value="Diversité">Diversité</option>
            <option value="Employabilité">Employabilité</option>
            <option value="FabLab">FabLab</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.map((event) => {
          const Icon = event.icon;
          return (
            <div key={event.id} className="group bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col">
              {/* Card Header with Icon */}
              <div className={`h-24 ${event.color} relative p-4 flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <Icon className="w-12 h-12 text-white relative z-10 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    event.status === 'Inscriptions ouvertes' ? 'bg-emerald-500 text-white animate-pulse' :
                    event.status === 'Terminé' ? 'bg-gray-200 text-gray-500' :
                    'bg-white/20 text-white backdrop-blur-md'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-odc-orange">{event.category}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span className="text-[10px] font-bold text-gray-400">{event.participants} Participants</span>
                </div>
                
                <h3 className="text-xl font-black text-odc-black mb-3 leading-tight group-hover:text-odc-orange transition-colors">
                  {event.title}
                </h3>
                
                <p className="text-sm text-gray-500 font-medium mb-6 line-clamp-3">
                  {event.description}
                </p>

                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-600">
                    <CalendarIcon className="w-4 h-4 text-odc-orange" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-600">
                    <MapPin className="w-4 h-4 text-odc-orange" />
                    {event.location}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                   <button 
                     onClick={() => navigate(`/events/${event.id}`)}
                     className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-odc-black hover:text-odc-orange transition-colors group/btn"
                   >
                     Voir plus
                     <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                   </button>
                   {user?.role !== 'manager' && event.status === 'Inscriptions ouvertes' && (
                     <button className="bg-odc-orange text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-odc-black transition-colors">
                       Rejoindre
                     </button>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="py-20 text-center">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
           </div>
           <h4 className="text-lg font-bold text-gray-400">Aucun événement ne correspond à votre recherche</h4>
          <button onClick={() => {setSearchTerm(''); setFilters({ year: '', city: '', entity: '', type: '' });}} className="text-odc-orange font-bold text-sm mt-2 hover:underline">Réinitialiser les filtres</button>
        </div>
      )}
    </div>
  );
}
