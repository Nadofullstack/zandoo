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
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header avec titre et sélecteur de période */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              📊 Dashboard Utilisateurs
            </h1>
            <p className="text-gray-600 mt-2">
              Suivi en temps réel des inscriptions et de la répartition des utilisateurs
            </p>
          </div>

          {/* Sélecteur de période */}
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <Calendar className="w-5 h-5 text-gray-600 ml-3" />
            <select
              value={periode}
              onChange={(e) => setPeriode(e.target.value as Periode)}
              className="px-4 py-2 bg-transparent text-gray-700 font-semibold focus:outline-none cursor-pointer"
            >
              {periodes.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques en cartes */}
      <section className="mb-8">
        <StatistiquesCards periode={periode} />
      </section>

      {/* Section des graphiques */}
      <section className="space-y-8 mb-8">
        {/* Graphique en courbe */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <LineChartUtilisateurs periode={periode} />
        </div>

        {/* Graphique en camembert */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <PieChartRoles periode={periode} />
        </div>
      </section>

      {/* Footer avec informations */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 md:p-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">🔒 Sécurité</h3>
            <p className="text-sm text-gray-600">
              Toutes les données sont chiffrées et accessibles uniquement aux administrateurs authentifiés.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">📈 Analyse</h3>
            <p className="text-sm text-gray-600">
              Visualisez les tendances d'inscription et analysez la répartition des utilisateurs par rôle.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">⚡ Performance</h3>
            <p className="text-sm text-gray-600">
              Graphiques optimisés et données actualisées automatiquement pour une gestion en temps réel.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardGraphiques;
