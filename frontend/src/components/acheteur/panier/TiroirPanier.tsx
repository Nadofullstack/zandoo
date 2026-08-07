import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ImageOff,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { usePanier } from '../../../context/PanierContext';

function formatPrix(prix: number): string {
  return new Intl.NumberFormat('fr-FR').format(prix) + ' FCFA';
}

export default function TiroirPanier() {
  const {
    panier,
    panierOuvert,
    fermerPanier,
    modifierQuantite,
    retirerDuPanier,
    viderPanier,
    lignesEnChargement,
    chargement,
  } = usePanier();

  /* Fermer avec Escape */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermerPanier();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [fermerPanier]);

  /* Bloquer le scroll du body quand le tiroir est ouvert */
  useEffect(() => {
    document.body.style.overflow = panierOuvert ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [panierOuvert]);

  const lignes = panier?.lignes ?? [];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          panierOuvert ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={fermerPanier}
        aria-hidden="true"
      />

      {/* Tiroir */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Votre panier"
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          panierOuvert ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ── En-tête ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-[#011023]" />
            <h2 className="text-lg font-black text-[#011023]">
              Mon panier
              {panier && panier.nombreArticles > 0 && (
                <span className="ml-2 text-sm font-bold text-[#FC7701]">
                  ({panier.nombreArticles} article{panier.nombreArticles > 1 ? 's' : ''})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={fermerPanier}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
            aria-label="Fermer le panier"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Contenu ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {chargement ? (
            /* Squelette */
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-5 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : lignes.length === 0 ? (
            /* Panier vide */
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <ShoppingCart size={36} className="text-gray-300" />
              </div>
              <h3 className="font-bold text-[#011023] mb-2">Votre panier est vide</h3>
              <p className="text-sm text-gray-400 mb-6">
                Découvrez nos produits et ajoutez-les à votre panier.
              </p>
              <Link
                to="/catalogue"
                onClick={fermerPanier}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(to right, #FC8900, #FC7700)' }}
              >
                Voir le catalogue
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            /* Liste des articles */
            <ul className="p-4 space-y-3">
              {lignes.map((ligne) => {
                const produit = ligne.produit;
                const prixUnitaire = produit.prixPromotionnel ?? produit.prix;
                const aPromo = !!produit.prixPromotionnel && produit.prixPromotionnel < produit.prix;
                const enChargement = lignesEnChargement.has(ligne._id);

                return (
                  <li
                    key={ligne._id}
                    className={`flex gap-3 p-3 rounded-2xl border border-gray-100 bg-white transition-opacity ${
                      enChargement ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {/* Photo */}
                    <Link
                      to={`/produit/${produit.slug}`}
                      onClick={fermerPanier}
                      className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100"
                    >
                      {produit.photoCouverture ? (
                        <img
                          src={produit.photoCouverture}
                          alt={produit.nom}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff size={24} className="text-gray-300" />
                        </div>
                      )}
                    </Link>

                    {/* Détails */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/produit/${produit.slug}`}
                        onClick={fermerPanier}
                        className="text-sm font-semibold text-[#011023] line-clamp-2 hover:text-[#FC7701] transition-colors"
                      >
                        {produit.nom}
                      </Link>

                      {ligne.variante && (
                        <p className="text-xs text-gray-400 mt-0.5">{ligne.variante}</p>
                      )}

                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {ligne.vendeur.nomEntreprise}
                      </p>

                      {/* Prix */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm font-black text-[#011023]">
                          {formatPrix(prixUnitaire)}
                        </span>
                        {aPromo && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrix(produit.prix)}
                          </span>
                        )}
                      </div>

                      {/* Contrôles quantité */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5">
                          <button
                            onClick={() => {
                              if (ligne.quantite <= 1) {
                                retirerDuPanier(ligne._id);
                              } else {
                                modifierQuantite(ligne._id, ligne.quantite - 1);
                              }
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-white hover:shadow-sm transition-all"
                            aria-label="Diminuer la quantité"
                            disabled={enChargement}
                          >
                            {enChargement ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Minus size={14} />
                            )}
                          </button>
                          <span className="w-7 text-center text-sm font-bold text-[#011023]">
                            {ligne.quantite}
                          </span>
                          <button
                            onClick={() => modifierQuantite(ligne._id, ligne.quantite + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-white hover:shadow-sm transition-all"
                            aria-label="Augmenter la quantité"
                            disabled={enChargement || ligne.quantite >= produit.quantiteDisponible}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => retirerDuPanier(ligne._id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
                          aria-label="Supprimer l'article"
                          disabled={enChargement}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Pied de page — total + actions ──────────────── */}
        {lignes.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 space-y-4 bg-white">
            {/* Récapitulatif */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Sous-total</span>
              <span className="font-black text-lg text-[#011023]">
                {formatPrix(panier?.total ?? 0)}
              </span>
            </div>

            {/* Bouton passer commande */}
            <Link
              to="/checkout"
              onClick={fermerPanier}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-white font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FC7701]/30 text-sm"
              style={{ background: 'linear-gradient(to right, #FC8900, #FC7700)' }}
            >
              Passer commande
              <ArrowRight size={16} />
            </Link>

            {/* Vider le panier */}
            <button
              onClick={viderPanier}
              className="w-full text-xs text-gray-400 hover:text-red-400 transition-colors py-1"
            >
              Vider le panier
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
