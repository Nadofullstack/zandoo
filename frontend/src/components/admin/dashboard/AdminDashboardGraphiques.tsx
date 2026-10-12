import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  getDashboardComparaison,
  getDashboardEvolutionVentes,
  getDashboardGraphiquesTemporelles,
  getDashboardKpisVentes,
  getDashboardStatutsCommandes,
} from '../../../services/admin/dashboardService';
import type { Periode } from '../../../services/admin/dashboardService';
import { useChargement } from './useChargement';
import { SelecteurPeriode } from './ui';
import { PERIODES } from './theme';
import KpisPrincipaux from './KpisPrincipaux';
import BarChartVentes from './BarChartVentes';
import DonutStatutCommandes from './DonutStatutCommandes';
import DernieresCommandes from './DernieresCommandes';
import ActionsRequises from './ActionsRequises';
import LineChartUtilisateurs from './LineChartUtilisateurs';
import RepartitionUtilisateurs from './RepartitionUtilisateurs';

const CLE_STOCKAGE_PERIODE = 'zandoo.admin.dashboard.periode';

/** Période mémorisée entre deux visites (confort uniquement, jamais bloquant) */
const periodeInitiale = (): Periode => {
  try {
    const p = localStorage.getItem(CLE_STOCKAGE_PERIODE);
    if (PERIODES.some((x) => x.value === p)) return p as Periode;
  } catch { /* stockage indisponible */ }
  return 'mois';
};

const heure = (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const TitreSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-3">{children}</h2>
);

/**
 * Tableau de bord administrateur.
 *
 * Une seule période pilote l'ensemble des indicateurs. Les requêtes sont
 * centralisées ici puis distribuées aux composants de présentation, ce qui
 * évite les appels en double (ex: la série CA alimente la carte KPI et le graphique).
 */
const AdminDashboardGraphiques: React.FC = () => {
  const [periode, setPeriode] = useState<Periode>(periodeInitiale);
  const [version, setVersion] = useState(0);
  const [majA, setMajA]       = useState(() => new Date());

  const cle = `${periode}:${version}`;
  const kpis         = useChargement(() => getDashboardKpisVentes(periode), cle);
  const ventes       = useChargement(() => getDashboardEvolutionVentes(periode), cle);
  const statuts      = useChargement(() => getDashboardStatutsCommandes(periode), cle);
  const comparaison  = useChargement(() => getDashboardComparaison(periode), cle);
  const inscriptions = useChargement(() => getDashboardGraphiquesTemporelles(periode), cle);

  const enCours = [kpis, ventes, statuts, comparaison, inscriptions].some((r) => r.chargement);

  const changerPeriode = (p: Periode) => {
    setPeriode(p);
    setMajA(new Date());
    try { localStorage.setItem(CLE_STOCKAGE_PERIODE, p); } catch { /* stockage indisponible */ }
  };

  const actualiser = () => {
    setVersion((v) => v + 1);
    setMajA(new Date());
  };

  const dateDuJour = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="w-full space-y-8">
      {/* ── En-tête ──────────────────────────────────────────────────────── */}
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400 first-letter:uppercase">{dateDuJour}</p>
          <h1 className="mt-1 text-2xl sm:text-[28px] font-extrabold text-primary tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-1">Vue d'ensemble de l'activité de la plateforme ZANDOO.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="hidden sm:inline text-xs text-slate-400 tabular-nums">
            Données à {heure(majA)}
          </span>
          <button
            type="button"
            onClick={actualiser}
            disabled={enCours}
            aria-label="Actualiser les données"
            title="Actualiser"
            className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-500 hover:text-primary hover:bg-slate-50 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors disabled:cursor-wait"
          >
            <RefreshCw className={`w-4 h-4 ${enCours ? 'animate-spin' : ''}`} />
          </button>
          <SelecteurPeriode value={periode} onChange={changerPeriode} />
        </div>
      </header>

      {/* ── Indicateurs clés ─────────────────────────────────────────────── */}
      <KpisPrincipaux
        periode={periode}
        kpis={kpis.donnees}
        ventes={ventes.donnees}
        inscriptions={inscriptions.donnees}
        comparaison={comparaison.donnees}
        erreur={kpis.erreur}
        onReessayer={kpis.recharger}
      />

      {/* ── Ventes ───────────────────────────────────────────────────────── */}
      <section>
        <TitreSection>Ventes</TitreSection>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <BarChartVentes {...ventes} onReessayer={ventes.recharger} />
          </div>
          <DonutStatutCommandes {...statuts} onReessayer={statuts.recharger} />
        </div>
      </section>

      {/* ── Opérations ───────────────────────────────────────────────────── */}
      <section>
        <TitreSection>Opérations</TitreSection>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <DernieresCommandes version={version} />
          </div>
          <ActionsRequises version={version} />
        </div>
      </section>

      {/* ── Utilisateurs ─────────────────────────────────────────────────── */}
      <section>
        <TitreSection>Utilisateurs</TitreSection>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <LineChartUtilisateurs {...inscriptions} onReessayer={inscriptions.recharger} />
          </div>
          <RepartitionUtilisateurs {...comparaison} onReessayer={comparaison.recharger} />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardGraphiques;
