import { useState } from 'react';
import { Pencil, PackageCheck, PackageX, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import type { Produit, StatutProduit } from '../../../types/admin';
import BadgeStatutProduit from './BadgeStatutProduit';
import ModalConfirmation from '../modal/ModalConfirmation';

interface Props {
  produits: Produit[];
  chargementAction: string | null;
  onChangerStatut: (id: string, statut: StatutProduit) => void;
  onSupprimer: (id: string) => void;
  onModifier: (id: string) => void;
}

type TypeModal = StatutProduit | 'supprimer';

interface EtatModal {
  ouvert: boolean;
  type: TypeModal;
  produitId: string;
  nomProduit: string;
}

const MODAL_INITIAL: EtatModal = { ouvert: false, type: 'en_stock', produitId: '', nomProduit: '' };

function formatPrix(v: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(v);
}

const LABEL_MODAL: Record<TypeModal, string> = {
  en_stock:   'Marquer en stock ?',
  faible:     'Marquer stock faible ?',
  en_rupture: 'Marquer en rupture ?',
  supprimer:  'Supprimer ce produit ?',
};

export default function TableauProduits({ produits, chargementAction, onChangerStatut, onSupprimer, onModifier }: Props) {
  const [modal, setModal] = useState<EtatModal>(MODAL_INITIAL);

  const ouvrir = (type: TypeModal, p: Produit) =>
    setModal({ ouvert: true, type, produitId: p._id, nomProduit: p.nom });
  const fermer = () => setModal(MODAL_INITIAL);

  const handleConfirmer = () => {
    if (modal.type === 'supprimer') onSupprimer(modal.produitId);
    else onChangerStatut(modal.produitId, modal.type);
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
              {['Produit', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Actions'].map((h) => (
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
                      {p.quantiteDisponible} unité{p.quantiteDisponible !== 1 ? 's' : ''}
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
                          {/* Modifier */}
                          <button
                            onClick={() => onModifier(p._id)}
                            title="Modifier le produit"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                            <Pencil size={16} />
                          </button>

                          {/* Changer statut stock */}
                          {p.statut !== 'en_stock' && (
                            <button onClick={() => ouvrir('en_stock', p)} title="Marquer en stock"
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
                              <PackageCheck size={16} />
                            </button>
                          )}
                          {p.statut !== 'faible' && (
                            <button onClick={() => ouvrir('faible', p)} title="Marquer stock faible"
                              className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-50 transition-colors">
                              <AlertTriangle size={16} />
                            </button>
                          )}
                          {p.statut !== 'en_rupture' && (
                            <button onClick={() => ouvrir('en_rupture', p)} title="Marquer en rupture"
                              className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors">
                              <PackageX size={16} />
                            </button>
                          )}

                          {/* Supprimer */}
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
        titre={LABEL_MODAL[modal.type]}
        description={
          modal.type === 'supprimer'
            ? `Cette action est irréversible. « ${modal.nomProduit} » sera définitivement supprimé.`
            : `Le statut de « ${modal.nomProduit} » sera mis à jour.`
        }
        labelConfirmer={modal.type === 'supprimer' ? 'Supprimer' : 'Confirmer'}
        variante={modal.type === 'supprimer' ? 'danger' : 'success'}
        chargement={!!chargementAction}
        onConfirmer={handleConfirmer}
        onAnnuler={fermer}
      />
    </>
  );
}
