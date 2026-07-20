import type { StatutPublicite } from '../../../types/admin';

const CONFIG: Record<StatutPublicite, { libelle: string; classes: string }> = {
  brouillon: { libelle: 'Brouillon', classes: 'bg-gray-100   text-gray-600   border border-gray-200'   },
  active:    { libelle: 'Active',    classes: 'bg-green-100  text-green-800  border border-green-200'  },
  pausee:    { libelle: 'Pausée',    classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  expiree:   { libelle: 'Expirée',   classes: 'bg-red-100    text-red-800    border border-red-200'    },
};

export default function BadgeStatutPublicite({ statut }: { statut: StatutPublicite }) {
  const { libelle, classes } = CONFIG[statut] ?? CONFIG['brouillon'];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {libelle}
    </span>
  );
}
