import type { RoleUtilisateur } from '../../../types/admin';

interface Props { role: RoleUtilisateur; }

const CONFIG: Record<RoleUtilisateur, { libelle: string; classes: string }> = {
  acheteur: { libelle: 'Acheteur', classes: 'bg-blue-100   text-blue-800   border border-blue-200'   },
  vendeur:  { libelle: 'Vendeur',  classes: 'bg-purple-100 text-purple-800 border border-purple-200' },
  livreur:  { libelle: 'Livreur',  classes: 'bg-cyan-100   text-cyan-800   border border-cyan-200'   },
  admin:    { libelle: 'Admin',    classes: 'bg-accent/15  text-accent     border border-accent/30'  },
};

export default function BadgeRole({ role }: Props) {
  const { libelle, classes } = CONFIG[role] ?? CONFIG['acheteur'];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {libelle}
    </span>
  );
}
