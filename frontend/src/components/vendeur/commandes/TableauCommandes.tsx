import type { CommandeVendeur, StatutCommande } from '../../../types/vendeur';
import BadgeStatutCommande from './BadgeStatutCommande';
import BoutonsActionsCommande from './BoutonsActionsCommande';

interface Props {
  commandes: CommandeVendeur[];
  chargementAction: string | null;
  onVoirDetails: (cmd: CommandeVendeur) => void;
  onChangerStatut: (id: string, statut: StatutCommande) => void;
  onDemanderAnnulation: (cmd: CommandeVendeur) => void;
}

export default function TableauCommandes({
  commandes, chargementAction, onVoirDetails, onChangerStatut, onDemanderAnnulation,
}: Props) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm" aria-label="Liste des commandes">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">N° commande</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Acheteur</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Articles</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Montant</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Statut</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Date</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {commandes.map((cmd) => (
            <tr key={cmd._id} className="hover:bg-gray-50/60 transition-colors">
              <td className="px-4 py-3.5 font-mono text-xs text-primary font-semibold">{cmd.numero}</td>
              <td className="px-4 py-3.5">
                <p className="font-medium text-primary">{cmd.acheteur?.fullName ?? '—'}</p>
                <p className="text-xs text-[#74777d]">{cmd.acheteur?.email ?? ''}</p>
              </td>
              <td className="px-4 py-3.5 text-[#74777d]">
                {cmd.lignes.length} article{cmd.lignes.length > 1 ? 's' : ''}
              </td>
              <td className="px-4 py-3.5 font-semibold text-primary whitespace-nowrap">
                {cmd.total.toLocaleString('fr-FR')} FCFA
              </td>
              <td className="px-4 py-3.5">
                <BadgeStatutCommande statut={cmd.statut} />
              </td>
              <td className="px-4 py-3.5 text-[#74777d] text-xs whitespace-nowrap">
                {new Date(cmd.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center justify-end gap-1.5">
                  <BoutonsActionsCommande
                    commande={cmd}
                    enCours={chargementAction === cmd._id}
                    onVoirDetails={onVoirDetails}
                    onChangerStatut={onChangerStatut}
                    onDemanderAnnulation={onDemanderAnnulation}
                    variante="desktop"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
