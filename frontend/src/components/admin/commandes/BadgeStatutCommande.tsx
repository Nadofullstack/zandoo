import type { StatutCommande } from '../../../types/admin';

interface BadgeStatutCommandeProps {
  statut: StatutCommande;
}

const CONFIG: Record<StatutCommande, { libelle: string; classes: string }> = {
  en_attente: { libelle: 'En attente', classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  payee:      { libelle: 'Payée',      classes: 'bg-blue-100   text-blue-800   border border-blue-200'   },
  expediee:   { libelle: 'Expédiée',   classes: 'bg-purple-100 text-purple-800 border border-purple-200' },
  livree:     { libelle: 'Livrée',     classes: 'bg-green-100  text-green-800  border border-green-200'  },
  annulee:    { libelle: 'Annulée',    classes: 'bg-red-100    text-red-800    border border-red-200'    },
};

/**
 * Badge coloré indiquant le statut d'une commande.
 */
export default function BadgeStatutCommande({ statut }: BadgeStatutCommandeProps) {
  const { libelle, classes } = CONFIG[statut] ?? CONFIG['en_attente'];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {libelle}
    </span>
  );
}
