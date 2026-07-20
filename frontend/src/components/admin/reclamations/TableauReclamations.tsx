import { Link } from 'react-router-dom';
import { Eye, Loader2 } from 'lucide-react';
import type { Reclamation } from '../../../types/admin';
import { BadgeStatutTicket, BadgePriorite } from './BadgeStatutTicket';

/* Labels lisibles pour les catégories */
const LABELS_CATEGORIE: Record<string, string> = {
  produit_non_recu:     'Produit non reçu',
  produit_defectueux:   'Produit défectueux',
  produit_non_conforme: 'Non conforme',
  remboursement:        'Remboursement',
  vendeur:              'Vendeur',
  paiement:             'Paiement',
  compte:               'Compte',
  autre:                'Autre',
};

interface TableauReclamationsProps {
  reclamations: Reclamation[];
  chargementAction: string | null;
}

/**
 * Tableau listant les tickets de réclamation.
 */
export default function TableauReclamations({
  reclamations, chargementAction,
}: TableauReclamationsProps) {
  if (reclamations.length === 0) {
    return (
      <div className="text-center py-16 text-[#74777d] text-sm">
        Aucune réclamation trouvée pour ces critères.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm" aria-label="Liste des réclamations">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {['Ticket', 'Utilisateur', 'Catégorie', 'Priorité', 'Statut', 'Date', ''].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {reclamations.map((rec) => {
            const enCours = chargementAction === rec._id;

            return (
              <tr key={rec._id} className="hover:bg-gray-50/60 transition-colors">
                {/* Numéro + sujet */}
                <td className="px-4 py-3.5">
                  <span className="font-mono text-xs font-semibold text-primary bg-gray-100 px-2 py-0.5 rounded">
                    {rec.numero}
                  </span>
                  <p className="text-sm text-primary mt-1 max-w-[200px] truncate" title={rec.sujet}>
                    {rec.sujet}
                  </p>
                </td>

                {/* Utilisateur */}
                <td className="px-4 py-3.5">
                  <p className="font-medium text-primary">{rec.utilisateur?.fullName ?? '—'}</p>
                  <p className="text-xs text-[#74777d] mt-0.5 capitalize">{rec.roleUtilisateur}</p>
                </td>

                {/* Catégorie */}
                <td className="px-4 py-3.5 text-sm text-[#74777d]">
                  {LABELS_CATEGORIE[rec.categorie] ?? rec.categorie}
                </td>

                {/* Priorité */}
                <td className="px-4 py-3.5">
                  <BadgePriorite priorite={rec.priorite} />
                </td>

                {/* Statut */}
                <td className="px-4 py-3.5">
                  <BadgeStatutTicket statut={rec.statut} />
                </td>

                {/* Date */}
                <td className="px-4 py-3.5 text-xs text-[#74777d] whitespace-nowrap">
                  {new Date(rec.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </td>

                {/* Action */}
                <td className="px-4 py-3.5 text-right">
                  {enCours ? (
                    <Loader2 size={18} className="animate-spin text-accent ml-auto" />
                  ) : (
                    <Link
                      to={`/admin/reclamations/${rec._id}`}
                      title="Voir le ticket"
                      aria-label={`Voir la réclamation ${rec.numero}`}
                      className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors inline-flex"
                    >
                      <Eye size={17} />
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
