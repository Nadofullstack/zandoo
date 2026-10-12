import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, RefreshCw, TriangleAlert } from 'lucide-react';
import type { Periode } from '../../../services/admin/dashboardService';
import { PERIODES } from './theme';

/* ── Carte : conteneur standard de tous les blocs du dashboard ─────────────── */

interface CarteProps {
  titre?: string;
  sousTitre?: string;
  action?: React.ReactNode;
  /** Atténue le contenu pendant un rechargement en arrière-plan */
  rechargement?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Carte: React.FC<CarteProps> = ({ titre, sousTitre, action, rechargement, className = '', children }) => (
  <section className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex flex-col ${className}`}>
    {titre && (
      <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-primary leading-tight">{titre}</h3>
          {sousTitre && <p className="text-xs text-slate-500 mt-1">{sousTitre}</p>}
        </div>
        {action}
      </header>
    )}
    <div className={`flex-1 flex flex-col px-5 pb-5 transition-opacity duration-300 ${rechargement ? 'opacity-50' : 'opacity-100'}`}>
      {children}
    </div>
  </section>
);

/* ── États : chargement, erreur, vide ──────────────────────────────────────── */

export const Squelette: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-lg bg-slate-100 animate-pulse ${className}`} />
);

export const EtatErreur: React.FC<{ message?: string; onReessayer?: () => void; className?: string }> = ({
  message = 'Impossible de charger ces données.',
  onReessayer,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center gap-3 text-center ${className}`}>
    <div className="p-2.5 rounded-full bg-red-50">
      <TriangleAlert className="w-5 h-5 text-red-500" />
    </div>
    <p className="text-sm text-slate-600">{message}</p>
    {onReessayer && (
      <button
        type="button"
        onClick={onReessayer}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Réessayer
      </button>
    )}
  </div>
);

export const EtatVide: React.FC<{ icone: React.ReactNode; titre: string; detail?: string; className?: string }> = ({
  icone,
  titre,
  detail,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center gap-2 text-center ${className}`}>
    <div className="p-3 rounded-full bg-slate-50 text-slate-300">{icone}</div>
    <p className="text-sm font-medium text-slate-600">{titre}</p>
    {detail && <p className="text-xs text-slate-400">{detail}</p>}
  </div>
);

/* ── Badge de variation vs période précédente ──────────────────────────────── */

export const BadgeVariation: React.FC<{ valeur: number; inverse?: boolean }> = ({ valeur, inverse = false }) => {
  const arrondi = Math.round(valeur * 10) / 10;
  if (arrondi === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 tabular-nums">
        <Minus className="w-3 h-3" /> 0 %
      </span>
    );
  }
  const hausse = arrondi > 0;
  const favorable = inverse ? !hausse : hausse;
  const Icone = hausse ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md tabular-nums ${
        favorable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
      }`}
    >
      <Icone className="w-3 h-3" />
      {hausse ? '+' : ''}
      {arrondi.toLocaleString('fr-FR')} %
    </span>
  );
};

/* ── Sélecteur de période (contrôle segmenté) ──────────────────────────────── */

export const SelecteurPeriode: React.FC<{ value: Periode; onChange: (p: Periode) => void }> = ({ value, onChange }) => (
  <div role="radiogroup" aria-label="Période" className="inline-flex p-1 rounded-xl bg-white border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
    {PERIODES.map((p) => {
      const actif = p.value === value;
      return (
        <button
          key={p.value}
          type="button"
          role="radio"
          aria-checked={actif}
          onClick={() => onChange(p.value)}
          className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${
            actif ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-primary hover:bg-slate-50'
          }`}
        >
          {p.label}
        </button>
      );
    })}
  </div>
);

/* ── Pastille de légende ───────────────────────────────────────────────────── */

export const Pastille: React.FC<{ couleur: string; className?: string }> = ({ couleur, className = '' }) => (
  <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${className}`} style={{ backgroundColor: couleur }} />
);
