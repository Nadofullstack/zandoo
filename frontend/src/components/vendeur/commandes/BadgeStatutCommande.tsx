export const STATUT_CONFIG: Record<string, { label: string; classes: string }> = {
  en_attente:     { label: 'En attente',     classes: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  payee:          { label: 'Payée',          classes: 'bg-blue-100   text-blue-700   border border-blue-200'   },
  en_preparation: { label: 'En préparation', classes: 'bg-orange-100 text-orange-700 border border-orange-200' },
  expediee:       { label: 'Expédiée',       classes: 'bg-purple-100 text-purple-700 border border-purple-200' },
  livree:         { label: 'Livrée',         classes: 'bg-green-100  text-green-700  border border-green-200'  },
  annulee:        { label: 'Annulée',        classes: 'bg-red-100    text-red-700    border border-red-200'    },
};

interface Props {
  statut: string;
}

export default function BadgeStatutCommande({ statut }: Props) {
  const cfg = STATUT_CONFIG[statut] ?? { label: statut, classes: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}
