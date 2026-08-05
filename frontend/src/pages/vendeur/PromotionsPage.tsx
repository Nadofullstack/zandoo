import { useState } from 'react';
import { Tag, Loader2, X, Percent } from 'lucide-react';
import DispositionVendeur from '../../components/vendeur/layout/DispositionVendeur';
import Alert from '../../components/ui/Alert';
import { usePromotionsVendeur } from '../../hooks/vendeur/usePromotionsVendeur';
import type { ProduitPromotion } from '../../types/vendeur';

interface ModalPromotion {
  ouvert: boolean;
  produit: ProduitPromotion | null;
  valeur: string;
}

export default function PromotionsPage() {
  const { produits, chargement, chargementAction, erreur, messageSucces, appliquerPromotion } = usePromotionsVendeur();
  const [modal, setModal] = useState<ModalPromotion>({ ouvert: false, produit: null, valeur: '' });

  const ouvrir = (p: ProduitPromotion) =>
    setModal({ ouvert: true, produit: p, valeur: p.prixPromotionnel ? String(p.prixPromotionnel) : '' });

  const fermer = () => setModal({ ouvert: false, produit: null, valeur: '' });

  const appliquer = async () => {
    if (!modal.produit) return;
    await appliquerPromotion(modal.produit._id, modal.valeur ? Number(modal.valeur) : null);
    fermer();
  };

  const supprimer = async (produitId: string) => {
    await appliquerPromotion(produitId, null);
  };

  return (
    <DispositionVendeur>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-primary flex items-center gap-2">
          <Tag size={22} className="text-accent" aria-hidden />
          Promotions
        </h1>
        <p className="text-sm text-[#74777d] mt-1">Gérez les prix promotionnels de vos produits.</p>
      </header>

      {erreur && <div className="mb-5"><Alert variant="error">{erreur}</Alert></div>}
      {messageSucces && <div className="mb-5"><Alert variant="success">{messageSucces}</Alert></div>}

      {chargement ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-accent" />
        </div>
      ) : produits.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl text-center py-16 text-[#74777d] text-sm">
          <Tag size={36} className="mx-auto mb-3 text-gray-300" />
          Aucun produit avec une promotion active.
          <p className="text-xs mt-1">Les promotions se créent depuis la liste de vos produits.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Liste des promotions">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Produit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Prix normal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Prix promo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Réduction</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#74777d] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {produits.map((p) => {
                  const reduction = p.prixPromotionnel
                    ? Math.round(((p.prix - p.prixPromotionnel) / p.prix) * 100)
                    : null;
                  const enCours = chargementAction === p._id;
                  return (
                    <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-primary">{p.nom}</td>
                      <td className="px-4 py-3.5 text-[#74777d]">{p.prix.toLocaleString('fr-FR')} FCFA</td>
                      <td className="px-4 py-3.5 font-bold text-accent">
                        {p.prixPromotionnel ? `${p.prixPromotionnel.toLocaleString('fr-FR')} FCFA` : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        {reduction !== null && (
                          <span className="flex items-center gap-1 text-green-600 font-semibold text-xs">
                            <Percent size={11} /> -{reduction}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {enCours ? (
                            <Loader2 size={16} className="animate-spin text-accent" />
                          ) : (
                            <>
                              <button
                                onClick={() => ouvrir(p)}
                                className="cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                              >
                                Modifier
                              </button>
                              {p.prixPromotionnel && (
                                <button
                                  onClick={() => supprimer(p._id)}
                                  className="cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                >
                                  Supprimer
                                </button>
                              )}
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
        </div>
      )}

      {/* Modal modifier promotion */}
      {modal.ouvert && modal.produit && (
        <div
          role="dialog" aria-modal="true" aria-labelledby="modal-promo-titre"
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary/60 backdrop-blur-sm px-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 id="modal-promo-titre" className="text-base font-bold text-primary">
                Modifier la promotion
              </h3>
              <button onClick={fermer} className="p-1 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-[#74777d] mb-4">
              Produit : <strong className="text-primary">{modal.produit.nom}</strong><br />
              Prix normal : <strong className="text-primary">{modal.produit.prix.toLocaleString('fr-FR')} FCFA</strong>
            </p>
            <div className="mb-5">
              <label htmlFor="prix-promo" className="block text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-1.5">
                Prix promotionnel (FCFA)
              </label>
              <input
                id="prix-promo"
                type="number"
                min={0}
                max={modal.produit.prix - 1}
                value={modal.valeur}
                onChange={(e) => setModal((p) => ({ ...p, valeur: e.target.value }))}
                placeholder={`Inférieur à ${modal.produit.prix.toLocaleString('fr-FR')}`}
                className="w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={fermer}
                className="cursor-pointer px-4 py-2 text-sm font-semibold text-[#74777d] hover:bg-gray-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={appliquer}
                disabled={!modal.valeur || Number(modal.valeur) <= 0 || Number(modal.valeur) >= modal.produit.prix}
                className="cursor-pointer px-5 py-2 text-sm font-semibold bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </DispositionVendeur>
  );
}
