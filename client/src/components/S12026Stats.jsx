import React from 'react';
import { Users, UserRound, GraduationCap, Building2 } from 'lucide-react';
import {
  S1_2026,
  S1_2026_BY_ODC,
  S1_2026_TOTAL,
  S1_2026_WOMEN,
  S1_2026_MEN,
} from '../data/odcStats';

const pct = (n) => Math.round((n / S1_2026_TOTAL) * 100);

function StatTile({ icon: Icon, value, label, sub, accent = false }) {
  return (
    <div
      className={`glass-card p-6 rounded-[28px] border-t-4 ${
        accent ? 'border-odc-orange' : 'border-odc-black'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${accent ? 'text-odc-orange' : 'text-gray-400'}`} />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-4xl font-black tracking-tighter text-odc-black">
        {value.toLocaleString('fr-FR')}
      </p>
      {sub && <p className="text-xs font-bold text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

/** Chiffre compact, sans tableau : un libellé, une valeur. */
function MiniStat({ label, value, sub }) {
  return (
    <div className="glass-card px-5 py-4 rounded-2xl">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{label}</p>
      <p className="text-2xl font-black tracking-tighter text-odc-black mt-1">
        {value.toLocaleString('fr-FR')}
      </p>
      {sub && <p className="text-[10px] font-bold text-odc-orange mt-0.5">{sub}</p>}
    </div>
  );
}

export default function S12026Stats() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-black text-odc-black">S1 2026</h3>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
          Janvier — Juin 2026
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatTile icon={Users} value={S1_2026_TOTAL} label="Bénéficiaires" accent />
        <StatTile
          icon={UserRound}
          value={S1_2026_WOMEN}
          label="Filles"
          sub={`${pct(S1_2026_WOMEN)}%`}
          accent
        />
        <StatTile icon={UserRound} value={S1_2026_MEN} label="Garçons" sub={`${pct(S1_2026_MEN)}%`} />
        <StatTile icon={GraduationCap} value={S1_2026.totalFormations} label="Formations" />
      </div>

      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
          Bénéficiaires par mois
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {S1_2026.months.map((m) => (
            <MiniStat
              key={m.month}
              label={m.month}
              value={m.participants}
              sub={`${m.women.toLocaleString('fr-FR')} F / ${m.men.toLocaleString('fr-FR')} H`}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
          Bénéficiaires par ODC
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {S1_2026_BY_ODC.map((o) => (
            <MiniStat key={o.entity} label={o.entity} value={o.participants} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
          Formations par type
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {S1_2026.formations.map((f) => (
            <MiniStat key={f.type} label={f.type} value={f.count} />
          ))}
        </div>
      </div>
    </div>
  );
}
