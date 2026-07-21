import React from 'react';
import { DATA_A_JOUR, PCT_WOMEN, PCT_MEN } from '../data/odcStats';

const fr = (n) => n.toLocaleString('fr-FR');

export default function AJourTable() {
  const { years, total, totalWomen, totalMen } = DATA_A_JOUR;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-black text-odc-black">À jour</h3>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
          Bénéficiaires par année — 2021 à S1 2026
        </p>
      </div>

      <div className="glass-card rounded-[28px] overflow-hidden">
        {/* overflow-x-auto : la table defile seule sur mobile, la page ne bouge pas */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[520px]">
            <thead>
              <tr className="bg-odc-orange text-white">
                <th className="px-5 py-3 text-left font-black uppercase tracking-widest text-[11px]">
                  Année
                </th>
                <th className="px-5 py-3 text-right font-black uppercase tracking-widest text-[11px]">
                  Nbre bénéficiaires
                </th>
                <th className="px-5 py-3 text-right font-black uppercase tracking-widest text-[11px]">
                  Nbre filles
                </th>
                <th className="px-5 py-3 text-right font-black uppercase tracking-widest text-[11px]">
                  Nbre garçons
                </th>
              </tr>
            </thead>
            <tbody>
              {years.map((y, i) => (
                <tr
                  key={y.year}
                  className={`border-b border-gray-100 ${i % 2 ? 'bg-gray-50/60' : 'bg-white/40'}`}
                >
                  <td className="px-5 py-3 font-black text-odc-black">{y.year}</td>
                  <td className="px-5 py-3 text-right font-bold tabular-nums">
                    {fr(y.participants)}
                  </td>
                  <td className="px-5 py-3 text-right font-bold tabular-nums">{fr(y.women)}</td>
                  <td className="px-5 py-3 text-right font-bold tabular-nums">{fr(y.men)}</td>
                </tr>
              ))}
              <tr className="bg-odc-black text-white">
                <td className="px-5 py-3 font-black uppercase tracking-widest text-[11px]">Somme</td>
                <td className="px-5 py-3 text-right font-black tabular-nums text-base">{fr(total)}</td>
                <td className="px-5 py-3 text-right font-black tabular-nums text-base">
                  {fr(totalWomen)}
                </td>
                <td className="px-5 py-3 text-right font-black tabular-nums text-base">
                  {fr(totalMen)}
                </td>
              </tr>
              <tr className="bg-orange-50">
                <td className="px-5 py-2 font-black text-gray-400 uppercase tracking-widest text-[10px]">
                  Répartition
                </td>
                <td className="px-5 py-2 text-right font-black text-gray-400 tabular-nums">100%</td>
                <td className="px-5 py-2 text-right font-black text-odc-orange tabular-nums">
                  {PCT_WOMEN}%
                </td>
                <td className="px-5 py-2 text-right font-black text-odc-black tabular-nums">
                  {PCT_MEN}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
