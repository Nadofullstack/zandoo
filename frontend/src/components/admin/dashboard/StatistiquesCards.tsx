import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  Truck,
  Activity,
} from 'lucide-react';
import { getDashboardComparaison } from '../../../services/admin/dashboardService';

/**
 * Composant: Cartes de statistiques - Comparaison périodique
 * Affiche les statistiques actuelles et les variations par rapport à la période précédente
 */
interface StatistiquesCardsProps {
  periode?: 'jour' | 'semaine' | 'mois' | 'annee';
}

interface StatComparaison {
  actuelle: {
    acheteurs: number;
    vendeurs: number;
    livreurs: number;
    total: number;
  };
  precedente: {
    acheteurs: number;
    vendeurs: number;
    livreurs: number;
    total: number;
  };
  variations: {
    acheteurs: number;
    vendeurs: number;
    livreurs: number;
    total: number;
  };
}

interface StatCardProps {
  titre: string;
  nombre: number;
  variation: number;
  icon: React.ReactNode;
  couleur: string;
}

/**
 * Composant individuel pour une carte statistique
 */
const StatCard: React.FC<StatCardProps> = ({ titre, nombre, variation, icon, couleur }) => {
  const isPositive = variation >= 0;
  const backgroundColor =
    couleur === 'blue' ? 'bg-blue-50'
    : couleur === 'green' ? 'bg-green-50'
    : couleur === 'amber' ? 'bg-amber-50'
    : 'bg-purple-50';

  const iconColor =
    couleur === 'blue' ? 'text-blue-600'
    : couleur === 'green' ? 'text-green-600'
    : couleur === 'amber' ? 'text-amber-600'
    : 'text-purple-600';

  const borderColor =
    couleur === 'blue' ? 'border-blue-200'
    : couleur === 'green' ? 'border-green-200'
    : couleur === 'amber' ? 'border-amber-200'
    : 'border-purple-200';

  const variationColor = isPositive ? 'text-green-600' : 'text-red-600';
  const variationBgColor = isPositive ? 'bg-green-100' : 'bg-red-100';

  return (
    <div
      className={`${backgroundColor} border ${borderColor} rounded-lg p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{titre}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{nombre}</h3>
        </div>
        <div className={`${iconColor} p-3 rounded-lg bg-white`}>{icon}</div>
      </div>

      {/* Badge de variation */}
      <div className="mt-4 flex items-center gap-2">
        <div className={`${variationBgColor} rounded-full p-1`}>
          {isPositive ? (
            <TrendingUp className={`w-4 h-4 ${variationColor}`} />
          ) : (
            <TrendingDown className={`w-4 h-4 ${variationColor}`} />
          )}
        </div>
        <span className={`text-sm font-semibold ${variationColor}`}>
          {isPositive ? '+' : ''}{variation.toFixed(1)}%
        </span>
        <span className="text-xs text-gray-500">vs période précédente</span>
      </div>
    </div>
  );
};

const StatistiquesCards: React.FC<StatistiquesCardsProps> = ({ periode = 'mois' }) => {
  const [data, setData] = useState<StatComparaison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const comparaison = await getDashboardComparaison(periode);
        setData(comparaison as StatComparaison);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError('Erreur lors du chargement des statistiques');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periode]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse h-32 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        ⚠️ {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { titre: 'Acheteurs', couleur: 'blue'   },
          { titre: 'Vendeurs',  couleur: 'green'  },
          { titre: 'Livreurs',  couleur: 'amber'  },
          { titre: 'Total',     couleur: 'purple' },
        ].map(({ titre, couleur }) => {
          const bg = couleur === 'blue' ? 'bg-blue-50 border-blue-200'
            : couleur === 'green'  ? 'bg-green-50 border-green-200'
            : couleur === 'amber'  ? 'bg-amber-50 border-amber-200'
            : 'bg-purple-50 border-purple-200';
          return (
            <div key={titre} className={`${bg} border rounded-lg p-6 shadow-sm`}>
              <p className="text-sm font-medium text-gray-600">{titre}</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">0</h3>
              <p className="mt-4 text-xs text-gray-400">Aucune donnée sur cette période</p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        titre="Acheteurs"
        nombre={data.actuelle.acheteurs}
        variation={data.variations.acheteurs}
        icon={<Users className="w-6 h-6" />}
        couleur="blue"
      />
      <StatCard
        titre="Vendeurs"
        nombre={data.actuelle.vendeurs}
        variation={data.variations.vendeurs}
        icon={<ShoppingBag className="w-6 h-6" />}
        couleur="green"
      />
      <StatCard
        titre="Livreurs"
        nombre={data.actuelle.livreurs}
        variation={data.variations.livreurs}
        icon={<Truck className="w-6 h-6" />}
        couleur="amber"
      />
      <StatCard
        titre="Total"
        nombre={data.actuelle.total}
        variation={data.variations.total}
        icon={<Activity className="w-6 h-6" />}
        couleur="purple"
      />
    </div>
  );
};

export default StatistiquesCards;
