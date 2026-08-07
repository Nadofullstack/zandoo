import { Loader2, ShoppingBag } from 'lucide-react';
import type { CommandeVendeur, StatutCommande } from '../../../types/vendeur';
import TableauCommandes from './TableauCommandes';
import CarteCommandeMobile from './CarteCommandeMobile';

interface Pagination {
  total: number;
  page: number;
  totalPages: number;
  limite: number;
}

interface Props {
  commandes: CommandeVendeur[];
  chargement: boolean;
  chargementAction: string | null;
  pagination: Pagination | null;
  pageActive: number;
  onVoirDetails: (cmd: CommandeVendeur) => void;
  onChangerStatut: (id: string, statut: StatutCommande) => void;
  onDemanderAnnulation: (cmd: CommandeVendeur) => void;
  onChangerPage: (page: number) => void;
}

export default function ListeCommandes({
  commandes, chargement, chargementAction, pagination, pageActive,
  onVoirDetails, onChangerStatut, onDemanderAnnulation, onChangerPage,
}: Props) {
  if (chargement) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    );
  }

  if (commandes.length === 0) {
    return (
      <div className="text-center py-20 text-[#74777d] text-sm">
        <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="font-medium text-primary">Aucune commande</p>
        <p className="text-xs mt-1">Aucun résultat pour ces critères.</p>
      </div>
    );
  }

  const actionProps = { onVoirDetails, onChangerStatut, onDemanderAnnulation };

  return (
    <>
      {/* Desktop */}
      <TableauCommandes commandes={commandes} chargementAction={chargementAction} {...actionProps} />

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {commandes.map((cmd) => (
          <CarteCommandeMobile
            key={cmd._id}
            commande={cmd}
            enCours={chargementAction === cmd._id}
            {...actionProps}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 text-sm text-[#74777d]">
          <p>{pagination.total} commande{pagination.total > 1 ? 's' : ''}</p>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onChangerPage(p)}
                className={[
                  'w-8 h-8 rounded-lg text-xs font-semibold transition-colors',
                  pageActive === p
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 text-primary hover:bg-gray-200',
                ].join(' ')}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
