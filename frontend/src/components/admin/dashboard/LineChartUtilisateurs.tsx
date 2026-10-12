import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { ChartLine } from 'lucide-react';
import type { ChartData } from '../../../services/admin/dashboardService';
import { Carte, EtatErreur, EtatVide, Pastille, Squelette } from './ui';
import { COULEURS, COULEURS_ROLES, TICKS_BASE, TOOLTIP_BASE, alpha } from './theme';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface Props {
  donnees: ChartData | null;
  chargement: boolean;
  erreur: boolean;
  onReessayer: () => void;
}

const SERIES = [
  { label: 'Acheteurs', couleur: COULEURS_ROLES.acheteurs },
  { label: 'Vendeurs',  couleur: COULEURS_ROLES.vendeurs },
  { label: 'Livreurs',  couleur: COULEURS_ROLES.livreurs },
];

const HAUTEUR = 'h-72';

const LineChartUtilisateurs: React.FC<Props> = ({ donnees, chargement, erreur, onReessayer }) => {
  const labels = donnees?.labels ?? [];
  const vide   = !donnees?.datasets.some((d) => d.data.some((v) => v > 0));

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    animation: { duration: 600, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: { ...TOOLTIP_BASE, callbacks: { label: (ctx) => ` ${ctx.dataset.label} : ${ctx.parsed.y}` } },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { ...TICKS_BASE, maxRotation: 0, autoSkipPadding: 12 } },
      y: {
        beginAtZero: true,
        grid: { color: COULEURS.grille },
        border: { display: false },
        ticks: { ...TICKS_BASE, precision: 0, maxTicksLimit: 6 },
      },
    },
  };

  const legende = (
    <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500 shrink-0">
      {SERIES.map((s) => (
        <span key={s.label} className="flex items-center gap-1.5"><Pastille couleur={s.couleur} /> {s.label}</span>
      ))}
    </div>
  );

  return (
    <Carte
      titre="Inscriptions"
      sousTitre="Nouveaux comptes créés par rôle"
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
          icone={<ChartLine className="w-6 h-6" />}
          titre="Aucune inscription sur cette période"
          detail="Sélectionnez une période plus large pour voir l'historique."
          className={HAUTEUR}
        />
      ) : (
        <div className={`relative ${HAUTEUR}`}>
          <Line
            data={{
              labels,
              datasets: SERIES.map((s) => ({
                label: s.label,
                data: donnees.datasets.find((d) => d.label === s.label)?.data ?? [],
                borderColor: s.couleur,
                backgroundColor: alpha(s.couleur, 0.06),
                borderWidth: 2,
                tension: 0.35,
                fill: s.label === 'Acheteurs',
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: s.couleur,
              })),
            }}
            options={options}
          />
        </div>
      )}
    </Carte>
  );
};

export default LineChartUtilisateurs;
