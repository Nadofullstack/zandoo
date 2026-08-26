import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import LineChartUtilisateurs from './LineChartUtilisateurs';
import PieChartRoles from './PieChartRoles';
import StatistiquesCards from './StatistiquesCards';

/**
 * Composant: Dashboard Admin - Graphiques et Statistiques Utilisateurs
 * 
 * Fonctionnalités:
 * - Affichage de graphiques professionnels et interactifs
 * - Comparaison temporelle des utilisateurs
 * - Répartition par rôle (Acheteurs, Vendeurs, Livreurs)
 * - Sélection de période (jour, semaine, mois, année)
 * - Sécurité: Accès réservé aux administrateurs
 * - Responsive design adapté à tous les écrans
 */

type Periode = 'jour' | 'semaine' | 'mois' | 'annee';

const AdminDashboardGraphiques: React.FC = () => {
  const [periode, setPeriode] = useState<Periode>('mois');

  const periodes = [
    { value: 'jour' as Periode, label: 'Jour' },
    { value: 'semaine' as Periode, label: 'Semaine' },
    { value: 'mois' as Periode, label: 'Mois' },
    { value: 'annee' as Periode, label: 'Année' },
  ];

  return (
    <div className="w-full">
      {/* En-tête de section avec sélecteur de période */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xs font-semibold text-[#74777d] uppercase tracking-wider">
            Utilisateurs
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Inscriptions et répartition par rôle
          </p>
        </div>

        {/* Sélecteur de période */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-sm self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-gray-400 ml-3" />
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value as Periode)}
            className="pr-3 py-2 bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
            aria-label="Sélectionner la période"
          >
            {periodes.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="mb-6">
        <StatistiquesCards periode={periode} />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Courbe d'évolution (occupe 2/3 en xl) */}
        <div className="xl:col-span-2">
          <LineChartUtilisateurs periode={periode} />
        </div>

        {/* Camembert répartition (1/3 en xl) */}
        <div className="xl:col-span-1">
          <PieChartRoles periode={periode} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardGraphiques;
