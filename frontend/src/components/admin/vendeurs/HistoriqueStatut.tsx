import { Clock } from 'lucide-react';
import type { HistoriqueStatut as IHistoriqueStatut } from '../../../types/admin';
import BadgeStatut from '../modal/BadgeStatut';

interface HistoriqueStatutProps {
  historique?: IHistoriqueStatut[];
}

/**
 * Liste chronologique inverse des changements de statut d'un vendeur.
 */
export default function HistoriqueStatut({ historique }: HistoriqueStatutProps) {
  if (!historique?.length) {
    return (
      <div className="bg-surface border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock size={15} className="text-accent" aria-hidden="true" />
          Historique des statuts
        </h3>
        <p className="text-sm text-[#74777d] italic">Aucun changement enregistré.</p>
      </div>
    );
  }

  /* Plus récent en premier */
  const triee = [...historique].reverse();

  return (
    <div className="bg-surface border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
        <Clock size={15} className="text-accent" aria-hidden="true" />
        Historique des statuts
      </h3>

      <ol className="space-y-3">
        {triee.map((entree) => (
          <li key={entree._id} className="flex items-start gap-3 text-sm">
            <div className="shrink-0 mt-0.5">
              <BadgeStatut statut={entree.statut} />
            </div>
            <div className="min-w-0">
              <p className="text-[#74777d] text-xs">
                {new Date(entree.modifieAt).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
                {entree.modifiePar && (
                  <> · par <span className="font-semibold text-primary">{entree.modifiePar.nomComplet}</span></>
                )}
              </p>
              {entree.raison && (
                <p className="mt-0.5 text-xs text-gray-500 italic">« {entree.raison} »</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
