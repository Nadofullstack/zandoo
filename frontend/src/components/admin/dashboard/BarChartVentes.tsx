import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { ChartColumn } from 'lucide-react';
import type { ChartData } from '../../../services/admin/dashboardService';
import { Carte, EtatErreur, EtatVide, Pastille, Squelette } from './ui';
import { COULEURS, TICKS_BASE, TOOLTIP_BASE, alpha, formatCompact, formatFCFA, formatNombre } from './theme';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler);

interface Props {
  donnees: ChartData | null;
  chargement: boolean;
  erreur: boolean;
  onReessayer: () => void;
}

const HAUTEUR = 'h-72 sm:h-80';

const BarChartVentes: React.FC<Props> = ({ donnees, chargement, erreur, onReessayer }) => {
  const labels    = donnees?.labels ?? [];
  const ca        = donnees?.datasets[0]?.data ?? [];
  const commandes = donnees?.datasets[1]?.data ?? [];
  const vide      = ca.every((v) => !v) && commandes.every((v) => !v);

  const legende = (
    <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500 shrink-0">
      <span className="flex items-center gap-1.5"><Pastille couleur={COULEURS.primaire} className="rounded-sm" /> CA</span>
      <span className="flex items-center gap-1.5"><Pastille couleur={COULEURS.accent} /> Commandes</span>
    </div>
  );

  const options: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    animation: { duration: 600, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...TOOLTIP_BASE,
        callbacks: {
          label: (ctx) =>
            ctx.datasetIndex === 0
              ? ` Chiffre d'affaires : ${formatFCFA(ctx.parsed.y ?? 0)}`
              : ` Commandes : ${formatNombre(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { ...TICKS_BASE, maxRotation: 0, autoSkipPadding: 12 },
      },
      yCA: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        grid: { color: COULEURS.grille },
        border: { display: false },
        ticks: { ...TICKS_BASE, maxTicksLimit: 6, callback: (v) => formatCompact(Number(v)) },
      },
      yCommandes: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        border: { display: false },
        ticks: { ...TICKS_BASE, maxTicksLimit: 6, precision: 0 },
      },
    },
  };

  return (
    <Carte
      titre="Évolution des ventes"
      sousTitre="Chiffre d'affaires (FCFA) et volume de commandes validées"
      action={legende}
      rechargement={chargement && !!donnees}
      className="h-full"
    >
      {erreur && !donnees ? (
        <EtatErreur onReessayer={onReessayer} className={HAUTEUR} />
      ) : !donnees ? (
        <Squelette className={HAUTEUR} />
      ) : vide ? (
        <EtatVide
          icone={<ChartColumn className="w-6 h-6" />}
          titre="Aucune vente sur cette période"
          detail="Sélectionnez une période plus large pour voir l'historique."
          className={HAUTEUR}
        />
      ) : (
        <div className={`relative ${HAUTEUR}`}>
          <Chart<'bar' | 'line', number[], string>
            type="bar"
            data={{
              labels,
              datasets: [
                {
                  type: 'bar',
                  label: "Chiffre d'affaires",
                  data: ca,
                  yAxisID: 'yCA',
                  backgroundColor: alpha(COULEURS.primaire, 0.88),
                  hoverBackgroundColor: COULEURS.primaire,
                  borderRadius: 6,
                  borderSkipped: false,
                  maxBarThickness: 28,
                  order: 2,
                },
                {
                  type: 'line',
                  label: 'Commandes',
                  data: commandes,
                  yAxisID: 'yCommandes',
                  borderColor: COULEURS.accent,
                  backgroundColor: COULEURS.accent,
                  borderWidth: 2,
                  tension: 0.35,
                  pointRadius: labels.length > 31 ? 0 : 3,
                  pointHoverRadius: 5,
                  pointBackgroundColor: '#ffffff',
                  pointBorderWidth: 2,
                  order: 1,
                },
              ],
            }}
            options={options}
          />
        </div>
      )}
    </Carte>
  );
};

export default BarChartVentes;
