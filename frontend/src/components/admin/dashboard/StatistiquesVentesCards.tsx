import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, CreditCard, Package, Clock } from 'lucide-react';
import { getDashboardKpisVentes } from '../../../services/admin/dashboardService';
import type { Periode, KpisVentes } from '../../../services/admin/dashboardService';

interface Props {
  periode?: Periode;
}

/* ── Carte KPI individuelle ───────────────────────────────────────────────── */
interface KpiCardProps {
  titre: string;
  valeur: string;
  variation?: number;   // undefined = pas de comparaison (ex: commandes en attente)
  icon: React.ReactNode;
  accent: 'indigo' | 'emerald' | 'amber' | 'rose';
  sousTitre?: string;
}

const ACCENT_MAP = {
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200', borderL: 'border-l-indigo-500',  icon: 'text-indigo-600',  iconBg: 'bg-indigo-100' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200',borderL: 'border-l-emerald-500', icon: 'text-emerald-600', iconBg: 'bg-emerald-100' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',  borderL: 'border-l-amber-500',   icon: 'text-amber-600',   iconBg: 'bg-amber-100' },
  rose:    { bg: 'bg-rose-50',    border: 'border-rose-200',   borderL: 'border-l-rose-500',    icon: 'text-rose-600',    iconBg: 'bg-rose-100' },
};

const KpiCard: React.FC<KpiCardProps> = ({ titre, valeur, variation, icon, accent, sousTitre }) => {
  const c = ACCENT_MAP[accent];
  const hausse = variation !== undefined && variation >= 0;

  return (
    <div
      className={[
        'rounded-xl border border-l-4 px-5 py-5',
        c.bg, c.border, c.borderL,
        'shadow-sm transition-shadow duration-200 hover:shadow-md',
        'flex items-start gap-4',
      ].join(' ')}
    >
      {/* Icône */}
      <div className={`shrink-0 p-2.5 rounded-xl ${c.iconBg}`}>
        <span className={c.icon}>{icon}</span>
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{titre}</p>
        <p className="text-2xl font-extrabold text-gray-900 mt-1 leading-tight">{valeur}</p>

        {variation !== undefined ? (
          <div className="mt-2 flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${hausse ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {hausse
                ? <TrendingUp className="w-3 h-3" />
                : <TrendingDown className="w-3 h-3" />
              }
              {hausse ? '+' : ''}{variation.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-400">vs période préc.</span>
          </div>
        ) : sousTitre ? (
          <p className="mt-1 text-xs text-gray-400">{sousTitre}</p>
        ) : null}
      </div>
    </div>
  );
};

/* ── Squelette de chargement ─────────────────────────────────────────────── */
const Skeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
    ))}
  </div>
);

/* ── Composant principal ─────────────────────────────────────────────────── */
const StatistiquesVentesCards: React.FC<Props> = ({ periode = 'mois' }) => {
  const [data, setData]       = useState<KpisVentes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setLoading(true);
      setError(null);
      try {
        const kpis = await getDashboardKpisVentes(periode);
        if (!annule) setData(kpis);
      } catch {
        if (!annule) setError('Impossible de charger les indicateurs de ventes.');
      } finally {
        if (!annule) setLoading(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [periode]);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
        ⚠ {error}
      </div>
    );
  }

  /* Valeurs de secours si l'API ne renvoie rien (période sans commandes) */
  const actuelle   = data?.actuelle   ?? { chiffreAffaires: 0, nombreCommandes: 0, panierMoyen: 0, commandesEnAttente: 0 };
  const variations = data?.variations ?? { chiffreAffaires: 0, nombreCommandes: 0, panierMoyen: 0 };

  const formatMontant = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(2)} M FCFA`
      : `${n.toLocaleString('fr-FR')} FCFA`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KpiCard
        titre="Chiffre d'affaires"
        valeur={formatMontant(actuelle.chiffreAffaires)}
        variation={variations.chiffreAffaires}
        icon={<CreditCard className="w-5 h-5" />}
        accent="indigo"
      />
      <KpiCard
        titre="Commandes"
        valeur={actuelle.nombreCommandes.toLocaleString('fr-FR')}
        variation={variations.nombreCommandes}
        icon={<ShoppingCart className="w-5 h-5" />}
        accent="emerald"
      />
      <KpiCard
        titre="Panier moyen"
        valeur={formatMontant(actuelle.panierMoyen)}
        variation={variations.panierMoyen}
        icon={<Package className="w-5 h-5" />}
        accent="amber"
      />
      <KpiCard
        titre="En attente"
        valeur={actuelle.commandesEnAttente.toLocaleString('fr-FR')}
        icon={<Clock className="w-5 h-5" />}
        accent="rose"
        sousTitre="Commandes à traiter"
      />
    </div>
  );
};

export default StatistiquesVentesCards;
