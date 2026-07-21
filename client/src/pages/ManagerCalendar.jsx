import React, { useEffect, useMemo, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  MapPin, 
  Filter, 
  X,
  Check,
  Palmtree,
  Star,
  GraduationCap,
  CalendarDays,
  Building2
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { api } from '../api/client';

const WEEK_DAYS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
const MONTHS_FR = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre',
];

function formatYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const CATEGORY_CONFIG = {
  formations: { label: 'Formations', color: 'bg-odc-orange', textColor: 'text-white', icon: GraduationCap, dotColor: 'bg-odc-orange' },
  events: { label: 'Événements', color: 'bg-blue-600', textColor: 'text-white', icon: Star, dotColor: 'bg-blue-600' },
  holidays: { label: 'Jours fériés', color: 'bg-red-500', textColor: 'text-white', icon: CalendarDays, dotColor: 'bg-red-500' },
  leaves: { label: 'Congés', color: 'bg-indigo-600', textColor: 'text-white', icon: Palmtree, dotColor: 'bg-indigo-600' },
};

function eventStyle(type = 'formations') {
  const config = CATEGORY_CONFIG[type] || CATEGORY_CONFIG.formations;
  return `${config.color} ${config.textColor}`;
}

export default function ManagerCalendar() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState(() => new Date());
  const [viewMode, setViewMode] = useState('month'); 
  const [activeCategories, setActiveCategories] = useState(['formations', 'events', 'holidays', 'leaves']);
  const [cityFilter, setCityFilter] = useState('all');
  const [entities, setEntities] = useState([]);
  const [entityFilter, setEntityFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const MOROCCAN_HOLIDAYS = useMemo(() => ({
    '01-01': 'Nouvel An',
    '01-11': 'Manifeste de l\'Indépendance',
    '05-01': 'Fête du Travail',
    '07-30': 'Fête du Trône',
    '08-14': 'Allégeance Oued Eddahab',
    '08-20': 'Révolution du Roi et du Peuple',
    '08-21': 'Fête de la Jeunesse',
    '11-06': 'Marche Verte',
    '11-18': 'Fête de l\'Indépendance',
  }), []);

  // Mock data for Congés (can be replaced by real API data)
  const MOCK_LEAVES = useMemo(() => [
    { id: 'l1', title: 'Congé Annuel - Team RH', dateStart: '2026-04-15', dateEnd: '2026-04-20', type: 'leaves' },
    { id: 'l2', title: 'Repos Compensateur', dateStart: '2026-05-02', dateEnd: '2026-05-02', type: 'leaves' },
  ], []);

  const isHoliday = (date) => {
    const key = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return MOROCCAN_HOLIDAYS[key];
  };

  const toggleCategory = (cat) => {
    setActiveCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const range = useMemo(() => {
    const base = new Date(cursor);
    if (viewMode === 'day') return { from: base, to: base };
    if (viewMode === 'week') {
      const from = new Date(base);
      from.setDate(base.getDate() - base.getDay());
      const to = new Date(from);
      to.setDate(from.getDate() + 6);
      return { from, to };
    }
    if (viewMode === 'year') {
      return {
        from: new Date(base.getFullYear(), 0, 1),
        to: new Date(base.getFullYear(), 11, 31),
      };
    }
    return {
      from: new Date(base.getFullYear(), base.getMonth(), 1),
      to: new Date(base.getFullYear(), base.getMonth() + 1, 0),
    };
  }, [cursor, viewMode]);

  const periodLabel = useMemo(() => {
    if (viewMode === 'day') return cursor.toLocaleDateString('fr-FR');
    if (viewMode === 'week') {
      return `${range.from.toLocaleDateString('fr-FR')} - ${range.to.toLocaleDateString('fr-FR')}`;
    }
    if (viewMode === 'year') return String(cursor.getFullYear());
    return `${MONTHS_FR[cursor.getMonth()]} ${cursor.getFullYear()}`;
  }, [cursor, viewMode, range]);

  useEffect(() => {
    api.get('/entities').then(res => {
      if (res.success) setEntities(res.data || []);
    }).catch(err => console.error("Error loading entities:", err));
  }, []);

  const cities = useMemo(() => {
    const set = new Set(entities.map(e => e.location).filter(Boolean));
    return Array.from(set).sort();
  }, [entities]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.set('dateFrom', formatYmd(range.from));
        params.set('dateTo', formatYmd(range.to));
        params.set('limit', '1000');
        const res = await api.get(`/formations?${params.toString()}`);
        const rows = (res?.data || []).filter((f) => f?.dateStart).map(f => ({
          ...f,
          // Categorize based on activityType or mock logic
          type: String(f.activityType || '').toLowerCase() === 'event' ? 'events' : 'formations'
        }));
        if (!cancelled) setItems(rows);
      } catch (e) {
        if (!cancelled) {
          setError("Impossible de charger le calendrier.");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [range]);

  const allItems = useMemo(() => [...items, ...MOCK_LEAVES], [items, MOCK_LEAVES]);

  const filteredItems = useMemo(() => {
    return allItems.filter((f) => {
      const matchCategory = activeCategories.includes(f.type);
      const matchCity = cityFilter === 'all' || String(f.location || f.entityId?.location || '').toLowerCase().includes(cityFilter.toLowerCase());
      const matchEntity = entityFilter === 'all' || (f.entityId?._id || f.entityId) === entityFilter;
      return matchCategory && matchCity && matchEntity;
    });
  }, [allItems, activeCategories, cityFilter, entityFilter]);

  const eventsByDate = useMemo(() => {
    const map = new Map();
    filteredItems.forEach((f) => {
      const start = new Date(f.dateStart);
      if (Number.isNaN(start.getTime())) return;
      
      const end = f.dateEnd ? new Date(f.dateEnd) : start;
      const current = new Date(start);
      current.setHours(0, 0, 0, 0);
      const limit = new Date(end);
      limit.setHours(23, 59, 59, 999);

      while (current <= limit) {
        const key = formatYmd(current);
        const arr = map.get(key) || [];
        arr.push({
          id: f._id || f.id,
          title: f.title || 'Activité',
          location: f.location || '',
          entityType: f.entityId?.type || '',
          dateStart: f.dateStart || null,
          dateEnd: f.dateEnd || null,
          status: f.status || '',
          trainerName: f.trainerName || '',
          description: f.description || '',
          type: f.type,
        });
        map.set(key, arr);
        current.setDate(current.getDate() + 1);
      }
    });
    return map;
  }, [filteredItems]);

  const days = useMemo(() => {
    const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());

    const cells = [];
    for (let i = 0; i < 42; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = formatYmd(d);
      cells.push({
        date: d,
        key,
        inMonth: d.getMonth() === cursor.getMonth(),
        events: eventsByDate.get(key) || [],
        holiday: activeCategories.includes('holidays') ? isHoliday(d) : null,
      });
    }
    return cells;
  }, [cursor, eventsByDate, activeCategories, MOROCCAN_HOLIDAYS]);

  const weekDays = useMemo(() => {
    const start = new Date(cursor);
    start.setDate(cursor.getDate() - cursor.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        date: d,
        key: formatYmd(d),
        events: eventsByDate.get(formatYmd(d)) || [],
        holiday: activeCategories.includes('holidays') ? isHoliday(d) : null,
      };
    });
  }, [cursor, eventsByDate, activeCategories, MOROCCAN_HOLIDAYS]);

  const dayEvents = useMemo(() => eventsByDate.get(formatYmd(cursor)) || [], [cursor, eventsByDate]);

  const shiftPeriod = (direction) => {
    if (viewMode === 'day') {
      setCursor((c) => new Date(c.getFullYear(), c.getMonth(), c.getDate() + direction));
      return;
    }
    if (viewMode === 'week') {
      setCursor((c) => new Date(c.getFullYear(), c.getMonth(), c.getDate() + 7 * direction));
      return;
    }
    if (viewMode === 'year') {
      setCursor((c) => new Date(c.getFullYear() + direction, c.getMonth(), c.getDate()));
      return;
    }
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + direction, 1));
  };

  return (
    <div className="flex flex-col xl:flex-row gap-4 pb-2 h-[calc(100vh-120px)] overflow-hidden">
      {/* Sidebar Filters */}
      <div className="w-full xl:w-64 flex-shrink-0 space-y-4 overflow-y-auto custom-scrollbar pr-2">
        <PageHeader title="Planning" badge="Live" />
        
        <div className="glass-card p-5 rounded-[24px] border border-gray-100 bg-white shadow-sm space-y-4">
           <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Affichage</p>
              <div className="space-y-1.5">
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <button 
                    key={key}
                    onClick={() => toggleCategory(key)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${config.color} text-white shadow-sm`}>
                         <config.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[11px] font-bold ${activeCategories.includes(key) ? 'text-odc-black' : 'text-gray-400'}`}>{config.label}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${activeCategories.includes(key) ? 'bg-odc-orange border-odc-orange' : 'border-gray-200'}`}>
                       {activeCategories.includes(key) && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
           </div>

           <div className="pt-4 border-t border-gray-50">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Ville</p>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-black uppercase tracking-wider focus:ring-0 outline-none w-full p-0"
                >
                  <option value="all">Toutes Villes</option>
                  {cities.map(city => (
                    <option key={city} value={city.toLowerCase()}>{city}</option>
                  ))}
                </select>
              </div>
           </div>

           <div className="pt-4 border-t border-gray-50">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Entité</p>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-black uppercase tracking-wider focus:ring-0 outline-none w-full p-0"
                >
                  <option value="all">Toutes Entités</option>
                  {entities.map(ent => (
                    <option key={ent._id} value={ent._id}>{ent.name}</option>
                  ))}
                </select>
              </div>
           </div>
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="glass-card flex-1 flex flex-col rounded-[32px] border border-gray-200 bg-white overflow-hidden shadow-lg min-h-0">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <button onClick={() => shiftPeriod(-1)} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
                  <ChevronLeft className="w-4 h-4 text-odc-black" />
                </button>
                <button onClick={() => setCursor(new Date())} className="px-4 py-2 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-tight hover:bg-gray-50">Aujourd'hui</button>
                <button onClick={() => shiftPeriod(1)} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
                  <ChevronRight className="w-4 h-4 text-odc-black" />
                </button>
              </div>
              <h2 className="text-xl font-black text-odc-black tracking-tighter flex items-center gap-2">
                 <CalendarIcon className="w-6 h-6 text-odc-orange" />
                 {periodLabel}
              </h2>
            </div>

            <div className="flex items-center bg-gray-100 rounded-xl p-1 shadow-inner">
              {[
                { id: 'day', label: 'Jour' },
                { id: 'week', label: 'Sem.' },
                { id: 'month', label: 'Mois' },
                { id: 'year', label: 'An' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                    viewMode === mode.id ? 'bg-white text-odc-orange shadow-sm' : 'text-gray-500 hover:text-odc-black'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {(viewMode === 'month' || viewMode === 'week') && (
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50 shrink-0">
              {WEEK_DAYS.map((w) => (
                <div key={w} className="px-2 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-center border-r border-gray-100 last:border-r-0">
                  {w}
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {viewMode === 'month' && (
              <div className="grid grid-cols-7 auto-rows-[minmax(100px,1fr)] h-full">
                {days.map((cell) => (
                  <DayCell key={cell.key} cell={cell} onSelect={setSelectedEvent} />
                ))}
              </div>
            )}

            {viewMode === 'week' && (
              <div className="grid grid-cols-7 h-full">
                {weekDays.map((cell) => (
                  <div key={cell.key} className={`border-r border-b border-gray-100 p-3 overflow-auto flex flex-col ${cell.date.getDay() === 0 || cell.date.getDay() === 6 ? 'bg-gray-50/30' : 'bg-white'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className={`text-base font-black ${cell.holiday ? 'text-red-500' : 'text-odc-black'}`}>{cell.date.getDate()}</div>
                      {cell.holiday && <span className="text-[8px] font-black uppercase bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{cell.holiday}</span>}
                    </div>
                    <div className="space-y-1.5 flex-grow">
                      {cell.events.map((evt) => (
                        <EventChip key={evt.id} evt={evt} onClick={() => setSelectedEvent(evt)} compact={false} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'day' && (
              <div className="p-8 bg-white h-full overflow-y-auto">
                <div className="flex items-center gap-4 mb-6">
                   <p className="text-3xl font-black text-odc-black tracking-tighter">{cursor.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                   {activeCategories.includes('holidays') && isHoliday(cursor) && <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full font-black text-[10px] uppercase tracking-widest">{isHoliday(cursor)}</span>}
                </div>
                <div className="space-y-3 max-w-2xl">
                  {dayEvents.map((evt) => (
                    <div key={evt.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl transition-all group cursor-pointer" onClick={() => setSelectedEvent(evt)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 inline-block ${eventStyle(evt.type)}`}>{CATEGORY_CONFIG[evt.type]?.label}</span>
                          <h4 className="text-xl font-black text-odc-black mb-1">{evt.title}</h4>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                            <MapPin className="w-3.5 h-3.5" /> {evt.location || 'Orange Digital Center'}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-odc-orange transition-colors" />
                      </div>
                    </div>
                  ))}
                  {!dayEvents.length && (
                    <div className="rounded-[32px] border-2 border-dashed border-gray-100 p-12 flex flex-col items-center justify-center text-center">
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Journée libre</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {viewMode === 'year' && (
              <div className="p-6 bg-white grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                 {MONTHS_FR.map((label, idx) => (
                    <div key={idx} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 hover:bg-white transition-all">
                       <p className="text-base font-black text-odc-black tracking-tight mb-2">{label}</p>
                       <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden flex">
                          {Object.keys(CATEGORY_CONFIG).map(cat => {
                             const count = items.filter(f => f.type === cat && new Date(f.dateStart).getMonth() === idx).length;
                             if (count === 0) return null;
                             return <div key={cat} style={{ width: `${(count/10)*100}%` }} className={CATEGORY_CONFIG[cat].color} />
                          })}
                       </div>
                    </div>
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl rounded-[40px] bg-white border border-gray-100 shadow-2xl overflow-hidden scale-in-center">
            <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl text-white shadow-xl ${eventStyle(selectedEvent.type)}`}>
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 mb-1">Détails de l'activité</p>
                   <h3 className="text-3xl font-black tracking-tighter text-odc-black">{selectedEvent.title}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="w-12 h-12 rounded-full bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center group">
                <X className="w-6 h-6 group-hover:rotate-90 transition-all" />
              </button>
            </div>
            <div className="p-10 space-y-8">
               <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Période</p>
                     <p className="font-bold text-odc-black">Du {new Date(selectedEvent.dateStart).toLocaleDateString()} au {new Date(selectedEvent.dateEnd).toLocaleDateString()}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Catégorie</p>
                     <p className={`font-black ${CATEGORY_CONFIG[selectedEvent.type]?.dotColor?.replace('bg-', 'text-')}`}>{CATEGORY_CONFIG[selectedEvent.type]?.label.toUpperCase()}</p>
                  </div>
               </div>
               {selectedEvent.description && (
                  <p className="text-gray-500 leading-relaxed font-medium bg-orange-50/30 p-6 rounded-3xl border border-orange-100/50">{selectedEvent.description}</p>
               )}
               <button onClick={() => setSelectedEvent(null)} className="w-full py-4 bg-odc-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-black/10 hover:scale-[1.02]">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DayCell({ cell, onSelect }) {
  return (
    <div className={`border-r border-b border-gray-100 p-3 flex flex-col h-full transition-all group ${cell.inMonth ? 'bg-white' : 'bg-gray-50/40 opacity-40'} ${cell.holiday ? 'bg-red-50/30' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <span className={`text-sm font-black ${cell.holiday ? 'text-red-500' : (cell.inMonth ? 'text-odc-black' : 'text-gray-300')}`}>{cell.date.getDate()}</span>
        {cell.holiday && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />}
      </div>
      <div className="space-y-1 overflow-y-auto custom-scrollbar flex-grow pr-1">
        {cell.events.map((evt) => (
          <EventChip key={evt.id} evt={evt} onClick={() => onSelect(evt)} />
        ))}
      </div>
    </div>
  );
}

function EventChip({ evt, onClick, compact = true }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg px-2 py-1.5 text-[9px] font-black transition-all hover:scale-[1.03] active:scale-95 shadow-sm ${eventStyle(evt.type)} ${compact ? '' : 'py-2.5 px-3'}`}
    >
      <p className="truncate uppercase tracking-tight">{evt.title}</p>
    </button>
  );
}
