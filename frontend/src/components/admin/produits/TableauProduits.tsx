import { useState } from 'react';
import { Eye, Trash2, Loader2 } from 'lucide-react';
import type { Produit } from '../../../types/admin';
import BadgeStatutProduit from './BadgeStatutProduit';
import ModalConfirmation from '../modal/ModalConfirmation';
import ModalDetailProduit from './ModalDetailProduit';

interface Props {
  produits: Produit[];
  chargementAction: string | null;
  onSupprimer: (id: string) => void;
}

interface EtatModalSupprimer {
  ouvert: boolean;
  produitId: string;
  nomProduit: string;
}

const MODAL_SUPPRIMER_INITIAL: EtatModalSupprimer = { ouvert: false, produitId: '', nomProduit: '' };

function formatPrix(v: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(v);
}

export default function TableauProduits({ produits, chargementAction, onSupprimer }: Props) {
  const [modalSupprimer, setModalSupprimer] = useState<EtatModalSupprimer>(MODAL_SUPPRIMER_INITIAL);
  const [produitDetailId, setProduitDetailId] = useState<string | null>(null);

  /* ── Suppression ─────────────────────────────────────────────────────── */
  const ouvrirSupprimer = (p: Produit) =>
    setModalSupprimer({ ouvert: true, produitId: p._id, nomProduit: p.nom });
  const fermerSupprimer = () => setModalSupprimer(MODAL_SUPPRIMER_INITIAL);

  const handleConfirmerSuppression = () => {
    onSupprimer(modalSupprimer.produitId);
    fermerSupprimer();
  };

  if (produits.length === 0) {
    return <p className="text-center py-16 text-sm text-[#74777d]">Aucun produit trouvé.</p>;
  }

  return (
    <>
      {/* ── Vue mobile (< lg) ─────────────────────────────────────────────── */}
      <div className="block lg:hidden overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm" aria-label="Liste des produits">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Produit', 'Prix', 'Statut', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="text-left px-3 py-2.5 text-xs font-semibold text-[#74777d] uppercase tracking-wider whitespace-nowrap"
                >
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
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      {p.photoCouverture ? (
                        <img
                          src={p.photoCouverture}
                          alt={p.nom}
                          className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 text-xs">
                          N/A
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-primary truncate max-w-[120px] text-xs">{p.nom}</p>
                        <p className="text-xs text-[#74777d]">
                          {typeof p.vendeur === 'object' && p.vendeur?.nomEntreprise
                            ? p.vendeur.nomEntreprise
                            : '—'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Prix */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    <p className="font-semibold text-primary text-xs">{formatPrix(p.prix)}</p>
                    {p.prixPromotionnel && (
                      <p className="text-xs text-green-600">{formatPrix(p.prixPromotionnel)}</p>
                    )}
                  </td>

                  {/* Statut */}
                  <td className="px-3 py-3">
                    <BadgeStatutProduit statut={p.statut} />
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      {enCours ? (
                        <Loader2 size={15} className="animate-spin text-accent" />
                      ) : (
                        <>
                          <button
                            onClick={() => setProduitDetailId(p._id)}
                            title="Voir le détail"
                            className="p-1.5 rounded-lg text-primary hover:bg-gray-100 transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => ouvrirSupprimer(p)}
                            title="Supprimer"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
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

      {/* ── Vue desktop (>= lg) ───────────────────────────────────────────── */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm" aria-label="Liste des produits">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Produit', 'Vendeur', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase tracking-wider whitespace-nowrap"
                >
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
                      {p.photoCouverture ? (
                        <img
                          src={p.photoCouverture}
                          alt={p.nom}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 text-xs">
                          N/A
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-primary truncate max-w-[160px]">{p.nom}</p>
                        <p className="text-xs text-[#74777d] font-mono">{p.reference}</p>
                      </div>
                    </div>
                  </td>

                  {/* Vendeur */}
                  <td className="px-4 py-3.5 text-[#74777d] text-xs whitespace-nowrap">
                    {typeof p.vendeur === 'object' && p.vendeur?.nomEntreprise ? (
                      p.vendeur.nomEntreprise
                    ) : (
                      <span className="italic text-gray-400">—</span>
                    )}
                  </td>

                  {/* Catégorie */}
                  <td className="px-4 py-3.5 text-[#74777d] text-xs whitespace-nowrap">
                    {typeof p.categorie === 'object' ? p.categorie?.nom ?? '—' : '—'}
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
                          <button
                            onClick={() => setProduitDetailId(p._id)}
                            title="Voir le détail"
                            className="p-1.5 rounded-lg text-primary hover:bg-gray-100 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => ouvrirSupprimer(p)}
                            title="Supprimer"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          >
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
      {/* fin vue desktop */}

      {/* ── Modal détail produit ─────────────────────────────────────────── */}
      <ModalDetailProduit
        produitId={produitDetailId}
        onFermer={() => setProduitDetailId(null)}
        onProduitSupprime={(id) => onSupprimer(id)}
      />

      {/* ── Modal confirmation suppression (depuis le tableau) ───────────── */}
      <ModalConfirmation
        ouvert={modalSupprimer.ouvert}
        titre="Supprimer ce produit ?"
        description={`Cette action est irréversible. « ${modalSupprimer.nomProduit} » sera définitivement supprimé.`}
        labelConfirmer="Supprimer"
        variante="danger"
        chargement={!!chargementAction}
        onConfirmer={handleConfirmerSuppression}
        onAnnuler={fermerSupprimer}
      />
    </>
  );
}
