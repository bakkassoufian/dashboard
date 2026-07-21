import React from 'react';
import PageHeader from '../components/PageHeader';
import { PieChart, Heart, MessageSquare, ThumbsUp } from 'lucide-react';

export default function Feedback() {
  const kpis = [
    { label: 'Satisfaction (Moyenne)', value: '4.8/5', trend: '+0.2 vs Q1', icon: ThumbsUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Net Promoter Score (NPS)', value: '72', trend: '+8 points', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Réponses Collectées', value: '1,245', trend: 'Taux participation 78%', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Sentiments Positifs (%)', value: '94%', trend: 'Indicateur stable', icon: PieChart, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const feedbacks = [
    { user: 'Ilyas B.', course: 'React Masterclass', rating: 5, comment: 'Formation exceptionnelle et formateur très pédagogue.', date: 'Il y a 2h' },
    { user: 'Sara M.', course: 'Design Thinking', rating: 4, comment: "Très bon contenu, l'organisation pourrait être améliorée.", date: "Aujourd'hui, 10:15" },
    { user: 'Karim S.', course: 'Python for Data', rating: 5, comment: 'Parfait pour un débutant, projets concrets très appréciés.', date: 'Hier, 16:40' },
    { user: 'Houda J.', course: 'Cybersecurity Intro', rating: 3, comment: 'Rythme un peu rapide pour une formation de 2 jours.', date: 'Il y a 2j' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Satisfaction & Feedback" 
        description="Analyses des retours bénéficiaires pour une démarche d'amélioration continue."
        badge="Qualité"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl">
            <div className={`p-3 w-fit rounded-xl mb-4 ${kpi.bg} ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <p className="text-gray-500 text-sm font-medium">{kpi.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold">{kpi.value}</h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-4">Derniers retours qualitatifs</h3>
            <div className="space-y-4">
               {feedbacks.map((f, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50/50 border border-transparent hover:border-gray-100 group transition-all">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-bold">{f.user}</span>
                       <span className="text-[10px] text-gray-400 capitalize">{f.date}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2 italic">"{f.comment}"</p>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{f.course}</span>
                       <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                             <Star key={star} className={`w-3 h-3 ${star <= f.rating ? 'fill-odc-orange text-odc-orange' : 'text-gray-200'}`} />
                          ))}
                       </div>
                    </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
            <h3 className="text-lg font-bold mb-4">Répartition des notes</h3>
            <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-100 rounded-xl mb-4">
               <p className="text-gray-400 text-sm italic underline">Graphique Radar de satisfaction</p>
            </div>
            <div className="space-y-3">
               {[{ label: 'Contenu', value: 4.9 }, { label: 'Formateur', value: 4.8 }, { label: 'Logistique', value: 3.2 }].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                     <span className="text-gray-600">{item.label}</span>
                     <div className="flex items-baseline gap-2">
                        <span className="font-bold">{item.value}/5</span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                           <div className={`h-full ${item.value > 4 ? 'bg-emerald-500' : item.value > 3 ? 'bg-orange-500' : 'bg-rose-500'}`} style={{ width: `${(item.value/5)*100}%` }} />
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

// Helper icons
function Star({ className }) {
   return (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
   );
}
