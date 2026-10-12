import type { StatutCommande } from '../../../types/admin';
import type { Periode } from '../../../services/admin/dashboardService';

/**
 * Thème partagé du dashboard admin : palette, libellés et formatage.
 * Les couleurs des graphiques sont définies ici (et non par l'API) pour
 * garantir une cohérence visuelle entre cartes, badges et graphiques.
 */

export const COULEURS = {
  primaire:   '#011023',
  accent:     '#FC7701',
  texte:      '#0f172a',
  texteDoux:  '#64748b',
  grille:     'rgba(15, 23, 42, 0.06)',
  positif:    '#059669',
  negatif:    '#dc2626',
} as const;

export const COULEURS_ROLES = {
  acheteurs: '#2563eb',
  vendeurs:  '#0d9488',
  livreurs:  '#FC7701',
} as const;

export const STATUTS_COMMANDE: Record<StatutCommande, { libelle: string; couleur: string; badge: string }> = {
  en_attente:     { libelle: 'En attente',     couleur: '#f59e0b', badge: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  payee:          { libelle: 'Payée',          couleur: '#2563eb', badge: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  en_preparation: { libelle: 'En préparation', couleur: '#6366f1', badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' },
  expediee:       { libelle: 'Expédiée',       couleur: '#8b5cf6', badge: 'bg-violet-50 text-violet-700 ring-violet-600/20' },
  livree:         { libelle: 'Livrée',         couleur: '#10b981', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  annulee:        { libelle: 'Annulée',        couleur: '#ef4444', badge: 'bg-red-50 text-red-700 ring-red-600/20' },
};

/** Couleur d'un statut à partir du libellé renvoyé par l'API */
export const couleurStatutParLibelle = (libelle: string): string =>
  Object.values(STATUTS_COMMANDE).find((s) => s.libelle === libelle)?.couleur ?? '#94a3b8';

export const PERIODES: { value: Periode; label: string; comparaison: string }[] = [
  { value: 'jour',    label: 'Jour',    comparaison: 'vs hier' },
  { value: 'semaine', label: 'Semaine', comparaison: 'vs semaine préc.' },
  { value: 'mois',    label: 'Mois',    comparaison: 'vs mois préc.' },
  { value: 'annee',   label: 'Année',   comparaison: 'vs année préc.' },
];

/* ── Formatage ─────────────────────────────────────────────────────────────── */

const nf = new Intl.NumberFormat('fr-FR');

export const formatNombre = (n: number): string => nf.format(Math.round(n));

export const formatFCFA = (n: number): string => `${nf.format(Math.round(n))} FCFA`;

/** Montant compact pour les axes et les KPI (ex: 1 250 000 → 1,25 M) */
export const formatCompact = (n: number): string => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} M`;
  if (abs >= 1_000)     return `${(n / 1_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} k`;
  return nf.format(n);
};

export const formatDateCourte = (iso: string): string =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

/* ── Options Chart.js communes ─────────────────────────────────────────────── */

export const TOOLTIP_BASE = {
  backgroundColor: COULEURS.primaire,
  titleColor: '#ffffff',
  bodyColor: 'rgba(255, 255, 255, 0.85)',
  padding: { x: 12, y: 10 },
  cornerRadius: 8,
  boxPadding: 4,
  usePointStyle: true,
  titleFont: { size: 12, weight: 'bold' as const, family: 'Hanken Grotesk' },
  bodyFont:  { size: 12, family: 'Hanken Grotesk' },
};

export const TICKS_BASE = {
  font: { size: 11, family: 'Hanken Grotesk' },
  color: COULEURS.texteDoux,
};

/** Rend une couleur hexadécimale semi-transparente */
export const alpha = (hex: string, a: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
