import type { StatutLivreurVendeur } from '../../../types/vendeur/livreur';

interface Props { statut: StatutLivreurVendeur; }

const CONFIG: Record<StatutLivreurVendeur, { libelle: string; classes: string }> = {
  en_attente: {
    libelle: 'En attente',
    classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  },
  actif: {
    libelle: 'Actif',
    classes: 'bg-green-100 text-green-800 border border-green-200',
  },
  suspendu: {
    libelle: 'Suspendu',
    classes: 'bg-red-100 text-red-800 border border-red-200',
  },
};

export default function BadgeStatutLivreur({ statut }: Props) {
  const { libelle, classes } = CONFIG[statut] ?? CONFIG['en_attente'];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {libelle}
    </span>
  );
}
