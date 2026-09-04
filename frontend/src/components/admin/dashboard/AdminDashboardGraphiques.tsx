import React, { useState } from 'react';
import { Calendar, Users, ShoppingBag } from 'lucide-react';
import LineChartUtilisateurs from './LineChartUtilisateurs';
import PieChartRoles from './PieChartRoles';
import StatistiquesCards from './StatistiquesCards';
import StatistiquesVentesCards from './StatistiquesVentesCards';
import BarChartVentes from './BarChartVentes';
import DonutStatutCommandes from './DonutStatutCommandes';

type Periode = 'jour' | 'semaine' | 'mois' | 'annee';

const PERIODES: { value: Periode; label: string }[] = [
  { value: 'jour',    label: 'Aujourd\'hui' },
  { value: 'semaine', label: 'Cette semaine' },
  { value: 'mois',    label: 'Ce mois' },
  { value: 'annee',   label: 'Cette année' },
];

/* ── Sélecteur de période réutilisable ──────────────────────────────────── */
interface SelectorProps {
  value: Periode;
  onChange: (p: Periode) => void;
}

const PeriodeSelector: React.FC<SelectorProps> = ({ value, onChange }) => (
  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-sm self-start sm:self-auto">
    <Calendar className="w-4 h-4 text-gray-400 ml-3 shrink-0" />
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Periode)}
      className="pr-3 py-2 bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
      aria-label="Sélectionner la période"
    >
      {PERIODES.map((p) => (
        <option key={p.value} value={p.value}>{p.label}</option>
      ))}
    </select>
  </div>
);

/* ── Composant principal ─────────────────────────────────────────────────── */
const AdminDashboardGraphiques: React.FC = () => {
  const [periodeVentes, setPeriodeVentes]       = useState<Periode>('mois');
  const [periodeUtilisateurs, setPeriodeUtilisateurs] = useState<Periode>('mois');

  return (
    <div className="w-full space-y-12">

      {/* ════════════════════════════════════════════════════════════════════
          SECTION VENTES
          ════════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="titre-ventes">
        {/* En-tête section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50">
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2
                id="titre-ventes"
                className="text-xs font-semibold text-[#74777d] uppercase tracking-wider"
              >
                Ventes
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Chiffre d'affaires, commandes et statuts
              </p>
            </div>
          </div>
          <PeriodeSelector value={periodeVentes} onChange={setPeriodeVentes} />
        </div>

        {/* KPIs ventes */}
        <div className="mb-6">
          <StatistiquesVentesCards periode={periodeVentes} />
        </div>

        {/* Graphiques ventes */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Évolution CA + commandes — 2/3 */}
          <div className="xl:col-span-2">
            <BarChartVentes periode={periodeVentes} />
          </div>
          {/* Donut statuts — 1/3 */}
          <div className="xl:col-span-1">
            <DonutStatutCommandes periode={periodeVentes} />
          </div>
        </div>
      </section>

      {/* Séparateur visuel */}
      <hr className="border-gray-100" />

      {/* ════════════════════════════════════════════════════════════════════
          SECTION UTILISATEURS
          ════════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="titre-utilisateurs">
        {/* En-tête section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2
                id="titre-utilisateurs"
                className="text-xs font-semibold text-[#74777d] uppercase tracking-wider"
              >
                Utilisateurs
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Inscriptions et répartition par rôle
              </p>
            </div>
          </div>
          <PeriodeSelector value={periodeUtilisateurs} onChange={setPeriodeUtilisateurs} />
        </div>

        {/* Cartes stats utilisateurs */}
        <div className="mb-6">
          <StatistiquesCards periode={periodeUtilisateurs} />
        </div>

        {/* Graphiques utilisateurs */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Courbe évolution — 2/3 */}
          <div className="xl:col-span-2">
            <LineChartUtilisateurs periode={periodeUtilisateurs} />
          </div>
          {/* Camembert rôles — 1/3 */}
          <div className="xl:col-span-1">
            <PieChartRoles periode={periodeUtilisateurs} />
          </div>
        </div>
      </section>

    </div>
  );
};

export default AdminDashboardGraphiques;
