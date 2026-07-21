import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Share2, 
  ExternalLink,
  Clock,
  Trophy,
  CheckCircle2
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

// Use the same mock data for consistency in this example
const events = [
  {
    id: 1,
    title: 'Global Innovation Week (GIW)',
    date: '15 - 20 Mai 2026',
    location: 'Technopark Casablanca',
    category: 'Innovation',
    status: 'À venir',
    description: 'Une semaine dédiée à l\'innovation technologique avec des conférences, des ateliers et des démonstrations des dernières solutions ODC. Rejoignez-nous pour explorer le futur de la tech au Maroc.',
    participants: 1500,
    color: 'bg-indigo-600',
    fullDescription: "Le Global Innovation Week est le rendez-vous incontournable des innovateurs, des startups et des grands groupes technologiques au Maroc. Durant 5 jours, vous aurez l'occasion de participer à des panels de discussion animés par des experts internationaux, de découvrir des prototypes innovants développés dans nos FabLabs, et de networker avec les leaders de l'écosystème numérique. Au programme : Keynotes sur l'IA, concours de pitch, ateliers de design thinking et showroom technologique."
  },
  {
    id: 4,
    title: 'Hello Women / Women in Tech',
    date: '08 Mars 2026',
    location: 'ODC Casablanca',
    category: 'Diversité',
    status: 'Terminé',
    description: 'Conférences et networking pour encourager la mixité dans les métiers de la tech et célébrer les réussites féminines.',
    participants: 350,
    color: 'bg-rose-500',
    fullDescription: "Célébrant la journée internationale des droits des femmes, Hello Women est un programme phare de Orange pour encourager les vocations féminines dans les métiers techniques. Cette édition marocaine a réuni plus de 350 participantes pour des sessions de mentorat, des témoignages inspirants de femmes leaders dans la tech marocaine, et des ateliers de personal branding. L'événement vise à briser les plafonds de verre et à construire un réseau solide de femmes prêtes à conquérir l'univers numérique."
  },
  {
    id: 5,
    title: 'ODC Job Dating',
    date: '24 Avril 2026',
    location: 'ODC Rabat',
    category: 'Employabilité',
    status: 'Terminé',
    description: 'Mise en relation directe entre nos talents formés à l\'école du code et les entreprises partenaires qui recrutent.',
    participants: 120,
    color: 'bg-blue-600',
    fullDescription: "Le ODC Job Dating est le pont direct entre la formation et l'emploi. Pour cette session à Rabat, nous avons sélectionné nos 120 meilleurs profils issus des dernières promotions de l'École du Code (Développement Web, Mobile, Data, Cloud) pour des entretiens flash avec plus de 30 entreprises partenaires. C'est l'opportunité pour les recruteurs de sourcer des talents certifiés ODC et pour nos apprenants de décrocher leur premier CDI ou un stage de pré-embauche."
  }
];

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // In a real app, you would fetch this from the API using the id
  const event = events.find(e => e.id === parseInt(id)) || events[0];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-odc-orange transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour aux événements
        </button>
        <div className="flex gap-2">
          <button className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-odc-orange hover:shadow-md transition-all">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
            <div className={`h-64 ${event.color} relative p-12 flex items-center justify-center`}>
               <div className="absolute inset-0 bg-black/10" />
               <div className="absolute top-8 left-8">
                 <span className="px-4 py-1.5 bg-white/20 backdrop-blur-xl text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                   {event.category}
                 </span>
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-white text-center relative z-10 leading-tight">
                 {event.title}
               </h1>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="flex flex-wrap gap-8 mb-10 pb-10 border-b border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-50 text-odc-orange rounded-2xl">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                    <p className="font-bold text-odc-black">{event.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lieu</p>
                    <p className="font-bold text-odc-black">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Capacité</p>
                    <p className="font-bold text-odc-black">{event.participants} Personnes</p>
                  </div>
                </div>
              </div>

              <div className="prose prose-orange max-w-none">
                <h3 className="text-2xl font-black text-odc-black mb-4">À propos de l'événement</h3>
                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                  {event.fullDescription}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {[
                    "Networking exclusif",
                    "Certificat de participation",
                    "Ateliers pratiques",
                    "Rencontre avec des experts"
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="font-bold text-sm text-gray-700">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions / Info */}
        <div className="space-y-8">
          {user?.role !== 'manager' && (
            <div className="glass-card bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black mb-6 text-odc-black">Participer</h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-odc-orange" />
                    <span className="text-xs font-bold text-odc-black">Statut</span>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                    event.status === 'Inscriptions ouvertes' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>

              {event.status === 'Inscriptions ouvertes' ? (
                <button className="w-full premium-gradient py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-lg shadow-orange-500/20 text-white">
                  S'inscrire maintenant
                </button>
              ) : (
                <button disabled className="w-full bg-gray-100 text-gray-400 py-4 rounded-2xl font-black uppercase tracking-widest text-sm cursor-not-allowed border border-gray-50">
                  Inscriptions closes
                </button>
              )}
              
              <p className="text-[10px] text-gray-400 text-center mt-6 uppercase font-bold tracking-tighter">
                Gratuit pour tous les membres ODC
              </p>
            </div>
          )}

          <div className="glass-card bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
             <h3 className="text-lg font-black text-odc-black mb-6 flex items-center gap-2">
               <Trophy className="w-5 h-5 text-amber-500" /> Programme Highlights
             </h3>
             <ul className="space-y-6">
                {[
                  { time: '09:00', title: 'Accueil & Networking', icon: Users },
                  { time: '10:30', title: 'Keynote Session', icon: Trophy },
                  { time: '14:00', title: 'Workshop Technique', icon: Clock }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="text-xs font-black text-odc-orange pt-1">{item.time}</div>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-tight">{item.title}</h4>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">ODC Main Hall</p>
                    </div>
                  </li>
                ))}
             </ul>
             
             <button className="w-full mt-8 flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">
               <ExternalLink className="w-4 h-4" />
               Télécharger l'agenda
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
