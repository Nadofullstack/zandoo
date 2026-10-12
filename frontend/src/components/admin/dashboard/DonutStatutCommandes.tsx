import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { PieChart } from 'lucide-react';
import type { ChartData } from '../../../services/admin/dashboardService';
import { Carte, EtatErreur, EtatVide, Pastille, Squelette } from './ui';
import { TOOLTIP_BASE, couleurStatutParLibelle, formatCompact, formatFCFA, formatNombre } from './theme';

ChartJS.register(ArcElement, Tooltip);

interface Props {
  donnees: ChartData | null;
  chargement: boolean;
  erreur: boolean;
  onReessayer: () => void;
}

const HAUTEUR = 'min-h-72';

const DonutStatutCommandes: React.FC<Props> = ({ donnees, chargement, erreur, onReessayer }) => {
  const labels   = donnees?.labels ?? [];
  const counts   = donnees?.datasets[0]?.data ?? [];
  const montants = donnees?.montants ?? [];
  const couleurs = labels.map(couleurStatutParLibelle);
  const total    = counts.reduce((a, b) => a + b, 0);
  const montantTotal = montants.reduce((a, b) => a + b, 0);
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '74%',
    animation: { duration: 600, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...TOOLTIP_BASE,
        callbacks: {
          label: (ctx) => [
            ` ${formatNombre(ctx.parsed)} commande${ctx.parsed > 1 ? 's' : ''} · ${pct(ctx.parsed).toLocaleString('fr-FR')} %`,
            ` ${formatFCFA(montants[ctx.dataIndex] ?? 0)}`,
          ],
        },
      },
    },
  };

  return (
    <Carte
      titre="Statuts des commandes"
      sousTitre="Toutes commandes créées sur la période"
      rechargement={chargement && !!donnees}
      className="h-full"
    >
      {erreur && !donnees ? (
        <EtatErreur onReessayer={onReessayer} className={HAUTEUR} />
      ) : !donnees ? (
        <Squelette className="h-72" />
      ) : total === 0 ? (
        <EtatVide icone={<PieChart className="w-6 h-6" />} titre="Aucune commande sur cette période" className={HAUTEUR} />
      ) : (
        <>
          <div className="relative h-44 mx-auto w-full max-w-[200px]">
            <Doughnut
              data={{
                labels,
                datasets: [{
                  data: counts,
                  backgroundColor: couleurs,
                  borderColor: '#ffffff',
                  borderWidth: 3,
                  hoverOffset: 6,
                }],
              }}
              options={options}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-primary tabular-nums">{formatNombre(total)}</span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">commandes</span>
            </div>
          </div>

          <ul className="mt-5 divide-y divide-slate-100">
            {labels.map((label, i) => (
              <li key={label} className="flex items-center gap-3 py-2 text-sm">
                <Pastille couleur={couleurs[i]} />
                <span className="flex-1 truncate text-slate-700">{label}</span>
                <span className="text-xs text-slate-400 tabular-nums">{formatCompact(montants[i] ?? 0)}</span>
                <span className="w-16 text-right font-semibold text-primary tabular-nums">
                  {formatNombre(counts[i] ?? 0)}
                  <span className="ml-1 text-[11px] font-normal text-slate-400">{Math.round(pct(counts[i] ?? 0))}%</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-auto pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Montant total</span>
            <span className="font-semibold text-primary tabular-nums">{formatFCFA(montantTotal)}</span>
          </p>
        </>
      )}
    </Carte>
  );
};

export default DonutStatutCommandes;
