import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { ReceiptText, ShoppingCart, UserPlus, Wallet } from 'lucide-react';
import type { ChartData, ComparaisonUtilisateurs, KpisVentes, Periode } from '../../../services/admin/dashboardService';
import { BadgeVariation, EtatErreur, Squelette } from './ui';
import { COULEURS, COULEURS_ROLES, PERIODES, alpha, formatCompact, formatFCFA, formatNombre } from './theme';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

/* ── Mini-courbe de tendance ───────────────────────────────────────────────── */

const Sparkline: React.FC<{ serie: (number | null)[]; couleur: string }> = ({ serie, couleur }) => (
  <Line
    data={{
      labels: serie.map((_, i) => i),
      datasets: [{
        data: serie,
        borderColor: couleur,
        backgroundColor: alpha(couleur, 0.12),
        borderWidth: 1.75,
        tension: 0.35,
        fill: true,
        pointRadius: 0,
        spanGaps: true,
      }],
    }}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false, beginAtZero: true } },
      elements: { line: { capBezierPoints: true } },
    }}
  />
);

/* ── Carte KPI ─────────────────────────────────────────────────────────────── */

interface CarteKpiProps {
  titre: string;
  valeur: string;
  valeurComplete?: string;
  variation?: number;
  comparaison: string;
  serie?: (number | null)[];
  couleur: string;
  icone: React.ReactNode;
}

const CarteKpi: React.FC<CarteKpiProps> = ({ titre, valeur, valeurComplete, variation, comparaison, serie, couleur, icone }) => (
  <article className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-5 transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)]">
    <div className="flex items-center gap-2.5">
      <span className="p-2 rounded-lg" style={{ backgroundColor: alpha(couleur, 0.1), color: couleur }}>
        {icone}
      </span>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{titre}</h3>
    </div>

    <div className="mt-4 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="text-2xl sm:text-[28px] font-extrabold text-primary leading-none tabular-nums truncate" title={valeurComplete}>
          {valeur}
        </p>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {variation !== undefined && <BadgeVariation valeur={variation} />}
          <span className="text-xs text-slate-400">{comparaison}</span>
        </div>
      </div>
      {serie && serie.length > 1 && (
        <div className="w-24 h-11 shrink-0" aria-hidden="true">
          <Sparkline serie={serie} couleur={couleur} />
        </div>
      )}
    </div>
  </article>
);

/* ── Rangée de KPIs ────────────────────────────────────────────────────────── */

interface Props {
  periode: Periode;
  kpis: KpisVentes | null;
  ventes: ChartData | null;
  inscriptions: ChartData | null;
  comparaison: ComparaisonUtilisateurs | null;
  erreur: boolean;
  onReessayer: () => void;
}

const KpisPrincipaux: React.FC<Props> = ({ periode, kpis, ventes, inscriptions, comparaison, erreur, onReessayer }) => {
  if (erreur && !kpis) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 py-8">
        <EtatErreur message="Impossible de charger les indicateurs clés." onReessayer={onReessayer} />
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Squelette key={i} className="h-[138px] rounded-2xl" />)}
      </div>
    );
  }

  const libComparaison = PERIODES.find((p) => p.value === periode)?.comparaison ?? '';

  const serieCA        = ventes?.datasets[0]?.data ?? [];
  const serieCommandes = ventes?.datasets[1]?.data ?? [];
  const seriePanier    = serieCA.map((ca, i) => (serieCommandes[i] ? ca / serieCommandes[i] : null));
  const serieInscrits  = inscriptions?.labels.map((_, i) =>
    inscriptions.datasets.reduce((somme, d) => somme + (d.data[i] ?? 0), 0),
  ) ?? [];

  const { actuelle, variations } = kpis;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <CarteKpi
        titre="Chiffre d'affaires"
        valeur={`${formatCompact(actuelle.chiffreAffaires)} FCFA`}
        valeurComplete={formatFCFA(actuelle.chiffreAffaires)}
        variation={variations.chiffreAffaires}
        comparaison={libComparaison}
        serie={serieCA}
        couleur={COULEURS.primaire}
        icone={<Wallet className="w-4 h-4" />}
      />
      <CarteKpi
        titre="Commandes"
        valeur={formatNombre(actuelle.nombreCommandes)}
        variation={variations.nombreCommandes}
        comparaison={libComparaison}
        serie={serieCommandes}
        couleur={COULEURS.accent}
        icone={<ShoppingCart className="w-4 h-4" />}
      />
      <CarteKpi
        titre="Panier moyen"
        valeur={`${formatCompact(actuelle.panierMoyen)} FCFA`}
        valeurComplete={formatFCFA(actuelle.panierMoyen)}
        variation={variations.panierMoyen}
        comparaison={libComparaison}
        serie={seriePanier}
        couleur="#6366f1"
        icone={<ReceiptText className="w-4 h-4" />}
      />
      <CarteKpi
        titre="Nouveaux inscrits"
        valeur={comparaison ? formatNombre(comparaison.actuelle.total) : '—'}
        variation={comparaison?.variations.total}
        comparaison={libComparaison}
        serie={serieInscrits}
        couleur={COULEURS_ROLES.acheteurs}
        icone={<UserPlus className="w-4 h-4" />}
      />
    </div>
  );
};

export default KpisPrincipaux;
