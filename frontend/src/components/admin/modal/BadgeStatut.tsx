import type { StatutVendeur, StatutProduit } from '../../../types/admin';

type StatutUnifie = StatutVendeur | StatutProduit;

interface BadgeStatutProps {
  statut: StatutUnifie;
}

const CONFIG: Record<string, { libelle: string; classes: string }> = {
  en_attente: { libelle: 'En attente', classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  approuve:   { libelle: 'Approuvé',   classes: 'bg-green-100  text-green-800  border border-green-200'  },
  suspendu:   { libelle: 'Suspendu',   classes: 'bg-red-100    text-red-800    border border-red-200'    },
  rejete:     { libelle: 'Rejeté',     classes: 'bg-red-100    text-red-800    border border-red-200'    },
  brouillon:  { libelle: 'Brouillon',  classes: 'bg-gray-100   text-gray-600   border border-gray-200'   },
};

/**
 * Badge coloré indiquant le statut d'un vendeur ou d'un produit.
 */
export default function BadgeStatut({ statut }: BadgeStatutProps) {
  const { libelle, classes } = CONFIG[statut] ?? CONFIG['en_attente'];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {libelle}
    </span>
  );
}
