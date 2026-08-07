import type { CommandeVendeur, StatutCommande } from '../../../types/vendeur';
import BadgeStatutCommande from './BadgeStatutCommande';
import BoutonsActionsCommande from './BoutonsActionsCommande';

interface Props {
  commande: CommandeVendeur;
  enCours: boolean;
  onVoirDetails: (cmd: CommandeVendeur) => void;
  onChangerStatut: (id: string, statut: StatutCommande) => void;
  onDemanderAnnulation: (cmd: CommandeVendeur) => void;
}

export default function CarteCommandeMobile({
  commande: cmd, enCours, onVoirDetails, onChangerStatut, onDemanderAnnulation,
}: Props) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 hover:border-gray-300 transition-colors">
      {/* En-tête carte */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs font-bold text-primary">{cmd.numero}</p>
          <p className="text-sm font-medium text-primary mt-0.5">{cmd.acheteur?.fullName ?? '—'}</p>
          <p className="text-xs text-[#74777d]">{cmd.acheteur?.email ?? ''}</p>
        </div>
        <BadgeStatutCommande statut={cmd.statut} />
      </div>

      {/* Infos résumées */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#74777d]">
          {cmd.lignes.length} article{cmd.lignes.length > 1 ? 's' : ''} ·{' '}
          {new Date(cmd.createdAt).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
        </span>
        <span className="font-bold text-primary text-sm">{cmd.total.toLocaleString('fr-FR')} FCFA</span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
        <BoutonsActionsCommande
          commande={cmd}
          enCours={enCours}
          onVoirDetails={onVoirDetails}
          onChangerStatut={onChangerStatut}
          onDemanderAnnulation={onDemanderAnnulation}
          variante="mobile"
        />
      </div>
    </div>
  );
}
