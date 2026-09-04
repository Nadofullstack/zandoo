import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { PieChart } from 'lucide-react';
import { getDashboardStatutsCommandes } from '../../../services/admin/dashboardService';
import type { Periode, ChartData } from '../../../services/admin/dashboardService';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  periode?: Periode;
}

/** Mappe les labels aux couleurs de badge Tailwind pour la légende custom */
const BADGE_COLORS: Record<string, string> = {
  'En attente':     'bg-amber-400',
  'Payée':          'bg-indigo-500',
  'En préparation': 'bg-blue-500',
  'Expédiée':       'bg-violet-500',
  'Livrée':         'bg-emerald-500',
  'Annulée':        'bg-red-500',
};

const DonutStatutCommandes: React.FC<Props> = ({ periode = 'mois' }) => {
  const [chartData, setChartData]   = useState<ChartData | null>(null);
  const [montants, setMontants]     = useState<number[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDashboardStatutsCommandes(periode);
        if (!annule) {
          setMontants(data.montants ?? []);
          setChartData(data);
        }
      } catch {
        if (!annule) setError('Impossible de charger la répartition des commandes.');
      } finally {
        if (!annule) setLoading(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [periode]);

  /* ── États intermédiaires ────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Chargement…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center justify-center">
        <p className="text-sm text-red-600 font-medium">⚠ {error}</p>
      </div>
    );
  }

  const total = (chartData?.datasets?.[0]?.data ?? []).reduce((a, b) => (a as number) + (b as number), 0) as number;
  const vide  = !chartData?.labels?.length || total === 0;

  if (vide) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-full flex flex-col items-center justify-center gap-3">
        <PieChart className="w-10 h-10 text-gray-300" />
        <p className="text-gray-500 font-medium text-sm">Aucune commande sur cette période</p>
      </div>
    );
  }

  /* ── Options Chart.js ────────────────────────────────────────────────── */
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          label: (ctx: any) => {
            const idx   = ctx.dataIndex;
            const count = ctx.parsed;
            const pct   = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
            const mont  = montants[idx] ?? 0;
            return [
              ` ${count} commande${count > 1 ? 's' : ''} (${pct}%)`,
              ` ${mont.toLocaleString('fr-FR')} FCFA`,
            ];
          },
        },
      },
    },
  };

  const labels  = chartData!.labels;
  const counts  = chartData!.datasets[0].data as number[];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col h-full">
      {/* En-tête */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">Statuts des commandes</h3>
        <p className="text-xs text-gray-500 mt-0.5">Répartition par état sur la période</p>
      </div>

      {/* Donut */}
      <div className="relative flex-1 flex items-center justify-center" style={{ minHeight: 200 }}>
        {/* Total centré */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-gray-900">{total}</span>
          <span className="text-xs text-gray-400 mt-0.5">commandes</span>
        </div>
        <div style={{ width: '100%', maxWidth: 240, height: 220 }}>
          <Doughnut data={chartData!} options={options} />
        </div>
      </div>

      {/* Légende custom */}
      <ul className="mt-4 space-y-2">
        {labels.map((label, i) => {
          const count = counts[i] ?? 0;
          const pct   = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
          const dot   = BADGE_COLORS[label] ?? 'bg-gray-400';
          return (
            <li key={label} className="flex items-center justify-between gap-2 text-xs text-gray-700">
              <span className="flex items-center gap-2 truncate">
                <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
                <span className="truncate">{label}</span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums">
                {count} <span className="font-normal text-gray-400">({pct}%)</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DonutStatutCommandes;
