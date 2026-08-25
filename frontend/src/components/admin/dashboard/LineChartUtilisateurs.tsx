import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { getDashboardGraphiquesTemporelles } from '../../../services/admin/dashboardService';

/* Enregistrement des composants Chart.js */
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

/**
 * Composant: Graphique en courbe - Évolution temporelle des utilisateurs
 * Affiche les trois rôles principaux (Acheteurs, Vendeurs, Livreurs) sur une période
 */
interface LineChartUtilisateursProps {
  periode?: 'jour' | 'semaine' | 'mois' | 'annee';
}

const LineChartUtilisateurs: React.FC<LineChartUtilisateursProps> = ({ periode = 'mois' }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardGraphiquesTemporelles(periode);
        setChartData(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement du graphique en courbe:', err);
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200 gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-gray-500 font-medium">Aucune inscription sur cette période</p>
        <p className="text-gray-400 text-sm">Essayez une période plus large (ex. Année)</p>
      </div>
    );
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 } as any,
          usePointStyle: true,
          padding: 15,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13 } as any,
        bodyFont: { size: 12 } as any,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: { size: 11 } as any,
          color: '#666',
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: { size: 11 } as any,
          color: '#666',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Évolution des Utilisateurs</h3>
        <p className="text-sm text-gray-500 mt-1">Suivi par jour, semaine, mois ou année</p>
      </div>
      <div className="relative h-96">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineChartUtilisateurs;
