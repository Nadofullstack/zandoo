import type { StatutCommande } from '../../../types/acheteur';
import { STATUTS } from './configCommandes';

export default function BadgeStatutCommande({ statut }: { statut: StatutCommande }) {
  const s = STATUTS[statut];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.point}`} />
      {s.libelle}
    </span>
  );
}
