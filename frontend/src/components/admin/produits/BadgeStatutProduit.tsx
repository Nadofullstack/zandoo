import type { StatutProduit } from '../../../types/admin';

interface Props { statut: StatutProduit; }

const CONFIG: Record<StatutProduit, { libelle: string; classes: string }> = {
  en_stock:   { libelle: 'En stock',   classes: 'bg-green-100  text-green-800  border border-green-200'  },
  faible:     { libelle: 'Faible',     classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  en_rupture: { libelle: 'En rupture', classes: 'bg-red-100    text-red-800    border border-red-200'    },
};

export default function BadgeStatutProduit({ statut }: Props) {
  const { libelle, classes } = CONFIG[statut] ?? CONFIG['en_stock'];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {libelle}
    </span>
  );
}
