import type { StatutReclamation, PrioriteReclamation } from '../../../types/admin';

/* ── Statut ──────────────────────────────────────────────────────────── */
interface BadgeStatutTicketProps { statut: StatutReclamation }

const CONFIG_STATUT: Record<StatutReclamation, { libelle: string; classes: string }> = {
  ouvert:               { libelle: 'Ouvert',           classes: 'bg-blue-100   text-blue-800   border border-blue-200'   },
  en_cours:             { libelle: 'En cours',          classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  en_attente_reponse:   { libelle: 'En attente',        classes: 'bg-orange-100 text-orange-800 border border-orange-200' },
  resolu:               { libelle: 'Résolu',            classes: 'bg-green-100  text-green-800  border border-green-200'  },
  ferme:                { libelle: 'Fermé',             classes: 'bg-gray-100   text-gray-600   border border-gray-200'   },
};

export function BadgeStatutTicket({ statut }: BadgeStatutTicketProps) {
  const { libelle, classes } = CONFIG_STATUT[statut] ?? CONFIG_STATUT['ouvert'];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {libelle}
    </span>
  );
}

/* ── Priorité ────────────────────────────────────────────────────────── */
interface BadgePrioriteProps { priorite: PrioriteReclamation }

const CONFIG_PRIORITE: Record<PrioriteReclamation, { libelle: string; classes: string }> = {
  basse:   { libelle: 'Basse',   classes: 'bg-gray-100   text-gray-600   border border-gray-200'   },
  normale: { libelle: 'Normale', classes: 'bg-blue-100   text-blue-700   border border-blue-200'   },
  haute:   { libelle: 'Haute',   classes: 'bg-orange-100 text-orange-700 border border-orange-200' },
  urgente: { libelle: 'Urgente', classes: 'bg-red-100    text-red-700    border border-red-200'    },
};

export function BadgePriorite({ priorite }: BadgePrioriteProps) {
  const { libelle, classes } = CONFIG_PRIORITE[priorite] ?? CONFIG_PRIORITE['normale'];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {libelle}
    </span>
  );
}
