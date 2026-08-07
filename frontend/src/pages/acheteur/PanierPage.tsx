import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, Minus, Plus, Trash2, ImageOff,
  ArrowLeft, Loader2, ShoppingBag,
} from 'lucide-react';
import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import DrawerCommande from '../../components/acheteur/panier/DrawerCommande';
import { usePanier } from '../../context/PanierContext';

function formatPrix(prix: number): string {
  return new Intl.NumberFormat('fr-FR').format(prix) + ' FCFA';
}

export default function PanierPage() {
  const {
    panier,
    chargement,
    modifierQuantite,
    retirerDuPanier,
    viderPanier,
    lignesEnChargement,
  } = usePanier();

  const [drawerOuvert, setDrawerOuvert] = useState(false);

  const lignes = panier?.lignes ?? [];

  /* ── Squelette chargement ───────────────────────── */
  if (chargement) {
    return (
      <AcheteurLayout>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12">
          <div className="h-8 bg-gray-100 animate-pulse rounded w-48 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl animate-pulse">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-5 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-64 bg-white rounded-2xl animate-pulse" />
          </div>
        </div>
      </AcheteurLayout>
    );
  }

  /* ── Panier vide ───────────────────────────────── */
  if (lignes.length === 0) {
    return (
      <AcheteurLayout>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20 text-center">
          <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={44} className="text-gray-300" />
          </div>
          <h1 className="text-2xl font-black text-[#011023] mb-3">Votre panier est vide</h1>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">
            Explorez notre catalogue et ajoutez des produits à votre panier.
          </p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FC7701]/30"
            style={{ background: 'linear-gradient(to right, #FC8900, #FC7700)' }}
          >
            <ShoppingBag size={18} />
            Voir le catalogue
          </Link>
        </div>
      </AcheteurLayout>
    );
  }

  return (
    <AcheteurLayout>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10">

        {/* ── En-tête ─────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#FC7701] transition-colors mb-2"
            >
              <ArrowLeft size={15} />
              Continuer mes achats
            </Link>
            <h1 className="text-2xl font-black text-[#011023]">
              Mon panier
              <span className="ml-2 text-base font-bold text-[#FC7701]">
                ({panier?.nombreArticles} article{(panier?.nombreArticles ?? 0) > 1 ? 's' : ''})
              </span>
            </h1>
          </div>
          <button
            onClick={viderPanier}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            Vider le panier
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* ── Liste des articles ──────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            {lignes.map((ligne) => {
              const produit = ligne.produit;
              const prixUnitaire = produit.prixPromotionnel ?? produit.prix;
              const aPromo = !!produit.prixPromotionnel && produit.prixPromotionnel < produit.prix;
              const enChargement = lignesEnChargement.has(ligne._id);
              const sousTotal = prixUnitaire * ligne.quantite;

              return (
                <div
                  key={ligne._id}
                  className={`flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 transition-opacity ${
                    enChargement ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  {/* Photo */}
                  <Link
                    to={`/produit/${produit.slug}`}
                    className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100"
                  >
                    {produit.photoCouverture ? (
                      <img
                        src={produit.photoCouverture}
                        alt={produit.nom}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff size={28} className="text-gray-300" />
                      </div>
                    )}
                  </Link>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/produit/${produit.slug}`}
                          className="font-semibold text-[#011023] text-sm hover:text-[#FC7701] transition-colors line-clamp-2"
                        >
                          {produit.nom}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {ligne.vendeur.nomEntreprise}
                        </p>
                        {ligne.variante && (
                          <p className="text-xs text-gray-400 mt-0.5">{ligne.variante}</p>
                        )}
                      </div>
                      {/* Bouton supprimer */}
                      <button
                        onClick={() => retirerDuPanier(ligne._id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all shrink-0"
                        aria-label="Supprimer l'article"
                        disabled={enChargement}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                      {/* Contrôle quantité */}
                      <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
                        <button
                          onClick={() => {
                            if (ligne.quantite <= 1) retirerDuPanier(ligne._id);
                            else modifierQuantite(ligne._id, ligne.quantite - 1);
                          }}
                          disabled={enChargement}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-white hover:shadow-sm transition-all"
                          aria-label="Diminuer"
                        >
                          {enChargement ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Minus size={14} />
                          )}
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-[#011023]">
                          {ligne.quantite}
                        </span>
                        <button
                          onClick={() => modifierQuantite(ligne._id, ligne.quantite + 1)}
                          disabled={enChargement || ligne.quantite >= produit.quantiteDisponible}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-30"
                          aria-label="Augmenter"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Prix */}
                      <div className="text-right">
                        <span className="font-black text-[#011023]">{formatPrix(sousTotal)}</span>
                        {aPromo && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatPrix(produit.prix * ligne.quantite)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Récapitulatif commande ──────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-black text-[#011023] text-lg mb-5">Récapitulatif</h2>

            {/* Lignes résumé */}
            <div className="space-y-3 mb-5">
              {lignes.map((ligne) => {
                const prixUnitaire = ligne.produit.prixPromotionnel ?? ligne.produit.prix;
                return (
                  <div key={ligne._id} className="flex justify-between text-sm">
                    <span className="text-gray-500 truncate flex-1 pr-2">
                      {ligne.produit.nom}
                      <span className="text-gray-400 ml-1">× {ligne.quantite}</span>
                    </span>
                    <span className="font-semibold text-[#011023] shrink-0">
                      {formatPrix(prixUnitaire * ligne.quantite)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Livraison</span>
                <span className="text-sm font-semibold text-green-600">À définir</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-[#011023]">Total</span>
                <span className="font-black text-xl text-[#011023]">
                  {formatPrix(panier?.total ?? 0)}
                </span>
              </div>
            </div>

            {/* Bouton passer commande */}
            <button
              onClick={() => setDrawerOuvert(true)}
              className="cursor-pointer w-full py-4 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FC7701]/30 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(to right, #FC8900, #FC7700)' }}
            >
              <ShoppingCart size={18} />
              Passer la commande
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Paiement sécurisé — livraison partout au Bénin
            </p>
          </div>
        </div>
      </div>

      {/* Drawer checkout — sort par la gauche */}
      <DrawerCommande
        ouvert={drawerOuvert}
        onFermer={() => setDrawerOuvert(false)}
      />
    </AcheteurLayout>
  );
}
