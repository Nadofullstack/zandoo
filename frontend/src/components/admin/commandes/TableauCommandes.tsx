import { useState } from 'react';
import { Eye } from 'lucide-react';
import type { Commande } from '../../../types/admin';
import BadgeStatutCommande from './BadgeStatutCommande';
import ModalDetailCommande from './ModalDetailCommande';

interface TableauCommandesProps {
  commandes: Commande[];
}

/**
 * Tableau des commandes — lecture seule.
 * L'admin peut uniquement consulter le détail via l'icône œil.
 */
export default function TableauCommandes({ commandes }: TableauCommandesProps) {
  const [commandeIdSelectionnee, setCommandeIdSelectionnee] = useState<string | null>(null);

  if (commandes.length === 0) {
    return (
      <div className="text-center py-16 text-[#74777d] text-sm">
        Aucune commande trouvée pour ces critères.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm" aria-label="Liste des commandes">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Numéro', 'Acheteur', 'Total', 'Statut', 'Date', 'Détail'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {commandes.map((commande) => (
              <tr key={commande._id} className="hover:bg-gray-50/60 transition-colors">

                {/* Numéro */}
                <td className="px-4 py-3.5">
                  <span className="font-mono text-xs font-semibold text-primary bg-gray-100 px-2 py-0.5 rounded">
                    {commande.numero}
                  </span>
                  <p className="text-xs text-[#74777d] mt-1">
                    {commande.lignes.length} article{commande.lignes.length > 1 ? 's' : ''}
                  </p>
                </td>

                {/* Acheteur */}
                <td className="px-4 py-3.5">
                  <p className="font-medium text-primary">{commande.acheteur?.fullName ?? '—'}</p>
                  <p className="text-xs text-[#74777d] mt-0.5">{commande.acheteur?.email ?? '—'}</p>
                </td>

                {/* Total */}
                <td className="px-4 py-3.5 font-semibold text-primary whitespace-nowrap">
                  {commande.total.toLocaleString('fr-FR')} {commande.devise}
                </td>

                {/* Statut */}
                <td className="px-4 py-3.5">
                  <BadgeStatutCommande statut={commande.statut} />
                </td>

                {/* Date */}
                <td className="px-4 py-3.5 text-xs text-[#74777d] whitespace-nowrap">
                  {new Date(commande.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </td>

                {/* Action — œil uniquement */}
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => setCommandeIdSelectionnee(commande._id)}
                    title="Voir le détail"
                    aria-label={`Voir la commande ${commande.numero}`}
                    className="p-1.5 rounded-lg text-[#74777d] hover:text-primary hover:bg-gray-100 transition-colors"
                  >
                    <Eye size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal détail — lecture seule */}
      <ModalDetailCommande
        commandeId={commandeIdSelectionnee}
        onFermer={() => setCommandeIdSelectionnee(null)}
      />
    </>
  );
}
