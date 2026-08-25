import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { getDashboardStatistiquesByRole } from '../../../services/admin/dashboardService';

/* Enregistrement des composants Chart.js */
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Composant: Graphique en camembert - Répartition des utilisateurs par rôle
 * Affiche les proportions d'Acheteurs, Vendeurs, Livreurs et Administrateurs
 */
interface PieChartRolesProps {
  periode?: 'jour' | 'semaine' | 'mois' | 'annee';
}

const PieChartRoles: React.FC<PieChartRolesProps> = ({ periode = 'mois' }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStatistiquesByRole(periode);
        setChartData(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement du graphique en camembert:', err);
        setError('Erreur lors du chargement du graphique');
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="mt-4 text-gray-600">Chargement du graphique...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border border-red-200">
        <div className="text-center">
          <p className="text-red-600 font-semibold">⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Répartition par Rôle</h3>
          <p className="text-sm text-gray-500 mt-1">Distribution des utilisateurs par type de compte</p>
        </div>
        <div className="flex flex-col items-center justify-center h-72 gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <p className="text-gray-500 font-medium">Aucune inscription sur cette période</p>
          <p className="text-gray-400 text-sm">Essayez une période plus large (ex. Année)</p>
        </div>
      </div>
    );
  }

  const totalDataset = chartData.datasets?.[0]?.data ?? [];
  const totalSum = totalDataset.reduce((a: number, b: number) => a + b, 0);
  if (totalSum === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Répartition par Rôle</h3>
          <p className="text-sm text-gray-500 mt-1">Distribution des utilisateurs par type de compte</p>
        </div>
        <div className="flex flex-col items-center justify-center h-72 gap-3">
          <p className="text-gray-500 font-medium">Aucun utilisateur inscrit sur cette période</p>
        </div>
      </div>
    );
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 12 } as any,
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13 } as any,
        bodyFont: { size: 12 } as any,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed ?? 0;
            const total: number = (context.dataset.data as number[]).reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Répartition par Rôle</h3>
        <p className="text-sm text-gray-500 mt-1">Distribution des utilisateurs par type de compte</p>
      </div>
      <div className="relative h-96 flex items-center justify-center">
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <Doughnut data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default PieChartRoles;
