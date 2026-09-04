import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';
import { getDashboardEvolutionVentes } from '../../../services/admin/dashboardService';
import type { Periode, ChartData } from '../../../services/admin/dashboardService';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface Props {
  periode?: Periode;
}

/** Formatte un montant en FCFA compact (ex: 1 250 000 → 1,25M) */
const formatCA = (val: number): string => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000)     return `${(val / 1_000).toFixed(1)}k`;
  return String(val);
};

const BarChartVentes: React.FC<Props> = ({ periode = 'mois' }) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDashboardEvolutionVentes(periode);
        if (!annule) setChartData(data);
      } catch {
        if (!annule) setError('Impossible de charger l\'évolution des ventes.');
      } finally {
        if (!annule) setLoading(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [periode]);

  /* ── États de chargement / erreur / vide ─────────────────────────────── */
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-96 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Chargement des ventes…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 h-96 flex items-center justify-center">
        <p className="text-sm text-red-600 font-medium">⚠ {error}</p>
      </div>
    );
  }

  const vide = !chartData?.labels?.length;

  if (vide) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-96 flex flex-col items-center justify-center gap-3">
        <TrendingUp className="w-10 h-10 text-gray-300" />
        <p className="text-gray-500 font-medium text-sm">Aucune vente sur cette période</p>
        <p className="text-gray-400 text-xs">Essayez une période plus large</p>
      </div>
    );
  }

  /* ── Options Chart.js ───────────────────────────────────────────────── */
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, font: { size: 12 }, padding: 16 },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => {
            const label = ctx.dataset.label ?? '';
            if (ctx.dataset.yAxisID === 'yCA') {
              return ` ${label} : ${Number(ctx.parsed.y).toLocaleString('fr-FR')} FCFA`;
            }
            return ` ${label} : ${ctx.parsed.y}`;
          },
        },
      },
    },
    scales: {
      yCA: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: {
          font: { size: 11 },
          color: '#6366f1',
          callback: (v: number) => formatCA(v),
        },
        title: { display: true, text: 'CA (FCFA)', color: '#6366f1', font: { size: 11, weight: '600' } },
      },
      yCommandes: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        ticks: {
          font: { size: 11 },
          color: '#f59e0b',
          precision: 0,
        },
        title: { display: true, text: 'Commandes', color: '#f59e0b', font: { size: 11, weight: '600' } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#64748b' },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-5">
        <h3 className="text-base font-bold text-gray-900">Évolution des ventes</h3>
        <p className="text-xs text-gray-500 mt-0.5">Chiffre d'affaires et volume de commandes</p>
      </div>
      <div className="relative h-80">
        <Chart type="bar" data={chartData!} options={options} />
      </div>
    </div>
  );
};

export default BarChartVentes;
