import { Loader2, Eye, PackageCheck, Truck, Ban } from 'lucide-react';
import type { CommandeVendeur, StatutCommande } from '../../../types/vendeur';

export const peutAnnuler  = (s: string) => ['en_attente', 'payee'].includes(s);
export const peutPreparer = (s: string) => s === 'payee';
export const peutExpedier = (s: string) => ['en_preparation', 'payee'].includes(s);

interface Props {
  commande: CommandeVendeur;
  enCours: boolean;
  onVoirDetails: (cmd: CommandeVendeur) => void;
  onChangerStatut: (id: string, statut: StatutCommande) => void;
  onDemanderAnnulation: (cmd: CommandeVendeur) => void;
  /** 'desktop' = icônes uniquement | 'mobile' = icône + label */
  variante?: 'desktop' | 'mobile';
}

export default function BoutonsActionsCommande({
  commande, enCours, onVoirDetails, onChangerStatut, onDemanderAnnulation, variante = 'desktop',
}: Props) {
  if (enCours) {
    return <Loader2 size={16} className="animate-spin text-accent" />;
  }

  const isDesktop = variante === 'desktop';

  const btnBase    = 'transition-colors flex items-center gap-1.5 font-semibold';
  const btnIcon    = `${btnBase} p-1.5 rounded-lg`;
  const btnLabeled = `${btnBase} px-3 py-1.5 rounded-lg text-xs`;

  return (
    <>
      {/* Voir détails */}
      <button
        onClick={() => onVoirDetails(commande)}
        title="Voir les détails"
        className={isDesktop
          ? `${btnIcon} bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-primary`
          : `${btnLabeled} bg-gray-100 text-gray-600 hover:bg-gray-200`}
      >
        <Eye size={isDesktop ? 14 : 12} />
        {!isDesktop && 'Détails'}
      </button>

      {/* Mettre en préparation */}
      {peutPreparer(commande.statut) && (
        <button
          onClick={() => onChangerStatut(commande._id, 'en_preparation' as StatutCommande)}
          title="Mettre en préparation"
          className={isDesktop
            ? `${btnIcon} bg-orange-100 text-orange-600 hover:bg-orange-200`
            : `${btnLabeled} bg-orange-100 text-orange-700 hover:bg-orange-200`}
        >
          <PackageCheck size={isDesktop ? 14 : 12} />
          {!isDesktop && 'Préparer'}
        </button>
      )}

      {/* Expédier */}
      {peutExpedier(commande.statut) && (
        <button
          onClick={() => onChangerStatut(commande._id, 'expediee' as StatutCommande)}
          title="Marquer comme expédiée"
          className={isDesktop
            ? `${btnIcon} bg-purple-100 text-purple-600 hover:bg-purple-200`
            : `${btnLabeled} bg-purple-100 text-purple-700 hover:bg-purple-200`}
        >
          <Truck size={isDesktop ? 14 : 12} />
          {!isDesktop && 'Expédier'}
        </button>
      )}

      {/* Annuler */}
      {peutAnnuler(commande.statut) && (
        <button
          onClick={() => onDemanderAnnulation(commande)}
          title="Annuler la commande"
          className={isDesktop
            ? `${btnIcon} bg-red-100 text-red-500 hover:bg-red-200`
            : `${btnLabeled} bg-red-100 text-red-600 hover:bg-red-200`}
        >
          <Ban size={isDesktop ? 14 : 12} />
          {!isDesktop && 'Annuler'}
        </button>
      )}
    </>
  );
}
