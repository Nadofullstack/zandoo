import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle, XCircle, Trash2, Loader2 } from 'lucide-react';
import type { Produit } from '../../../types/admin';
import BadgeStatutProduit from './BadgeStatutProduit';
import ModalConfirmation from '../modal/ModalConfirmation';

interface Props {
  produits: Produit[];
  chargementAction: string | null;
  onApprouver: (id: string) => void;
  onRejeter: (id: string, raison: string) => void;
  onSupprimer: (id: string) => void;
}

type TypeModal = 'approuver' | 'rejeter' | 'supprimer';

interface EtatModal {
  ouvert: boolean;
  type: TypeModal;
  produitId: string;
  nomProduit: string;
}

const MODAL_INITIAL: EtatModal = { ouvert: false, type: 'approuver', produitId: '', nomProduit: '' };

/** Formate un prix en F CFA */
function formatPrix(v: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(v);
}

export default function TableauProduits({ produits, chargementAction, onApprouver, onRejeter, onSupprimer }: Props) {
  const [modal, setModal] = useState<EtatModal>(MODAL_INITIAL);

  const ouvrir = (type: TypeModal, p: Produit) =>
    setModal({ ouvert: true, type, produitId: p._id, nomProduit: p.nom });
  const fermer = () => setModal(MODAL_INITIAL);

  const handleConfirmer = (raison?: string) => {
    if (modal.type === 'approuver') onApprouver(modal.produitId);
    else if (modal.type === 'rejeter') onRejeter(modal.produitId, raison ?? '');
    else onSupprimer(modal.produitId);
    fermer();
  };

  if (produits.length === 0) {
    return <p className="text-center py-16 text-sm text-[#74777d]">Aucun produit trouvé.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm" aria-label="Liste des produits">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Produit', 'Catégorie', 'Vendeur', 'Prix', 'Stock', 'Statut', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {produits.map((p) => {
              const enCours = chargementAction === p._id;
              return (
                <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                  {/* Produit */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {p.photos[0] ? (
                        <img src={p.photos[0]} alt={p.nom} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 text-xs">N/A</div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-primary truncate max-w-[180px]">{p.nom}</p>
                        <p className="text-xs text-[#74777d] font-mono">{p.reference}</p>
                      </div>
                    </div>
                  </td>

                  {/* Catégorie */}
                  <td className="px-4 py-3.5 text-[#74777d] text-xs whitespace-nowrap">
                    {p.categorie?.nom ?? '—'}
                  </td>

                  {/* Vendeur */}
                  <td className="px-4 py-3.5 text-[#74777d] text-xs whitespace-nowrap">
                    {p.vendeur?.nomEntreprise ?? '—'}
                  </td>

                  {/* Prix */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="font-semibold text-primary">{formatPrix(p.prix)}</p>
                    {p.prixPromotionnel && (
                      <p className="text-xs text-green-600">{formatPrix(p.prixPromotionnel)}</p>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`text-xs font-semibold ${p.enStock ? 'text-green-700' : 'text-red-600'}`}>
                      {p.enStock ? `${p.quantiteDisponible} en stock` : 'Rupture'}
                    </span>
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3.5">
                    <BadgeStatutProduit statut={p.statut} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {enCours ? (
                        <Loader2 size={17} className="animate-spin text-accent" />
                      ) : (
                        <>
                          {p.statut !== 'approuve' && (
                            <button onClick={() => ouvrir('approuver', p)} title="Approuver"
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {p.statut !== 'rejete' && p.statut !== 'brouillon' && (
                            <button onClick={() => ouvrir('rejeter', p)} title="Rejeter"
                              className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors">
                              <XCircle size={16} />
                            </button>
                          )}
                          <Link to={`/admin/produits/${p._id}`} title="Voir / Modifier"
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors">
                            <Eye size={16} />
                          </Link>
                          <button onClick={() => ouvrir('supprimer', p)} title="Supprimer"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ModalConfirmation
        ouvert={modal.ouvert}
        titre={
          modal.type === 'approuver' ? 'Approuver ce produit ?' :
          modal.type === 'rejeter'   ? 'Rejeter ce produit ?' :
                                       'Supprimer ce produit ?'
        }
        description={
          modal.type === 'approuver' ? `« ${modal.nomProduit} » sera publié sur la plateforme.` :
          modal.type === 'rejeter'   ? `« ${modal.nomProduit} » sera rejeté et le vendeur notifié.` :
                                       `Cette action est irréversible. « ${modal.nomProduit} » sera définitivement supprimé.`
        }
        labelConfirmer={modal.type === 'approuver' ? 'Approuver' : modal.type === 'rejeter' ? 'Rejeter' : 'Supprimer'}
        variante={modal.type === 'approuver' ? 'success' : 'danger'}
        avecRaison={modal.type === 'rejeter'}
        labelRaison="Motif du rejet (requis)"
        chargement={!!chargementAction}
        onConfirmer={handleConfirmer}
        onAnnuler={fermer}
      />
    </>
  );
}
