import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight, Heart, ShoppingCart, ImageOff,
  SearchX, Store, ArrowLeft,
} from 'lucide-react';
import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import CarteProduit from '../../components/acheteur/accueil/CarteProduit';
import { useDetailProduit } from '../../hooks/acheteur/useDetailProduit';

function formatPrix(prix: number): string {
  return new Intl.NumberFormat('fr-FR').format(prix) + ' FCFA';
}

export default function DetailProduitPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { produit, similaires, chargement, erreur } = useDetailProduit(slug);

  /* ── Squelette ──────────────────────────────────── */
  if (chargement) {
    return (
      <AcheteurLayout>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-100 animate-pulse rounded-2xl" />
            <div className="space-y-4 pt-4">
              <div className="h-4 bg-gray-100 animate-pulse rounded w-1/4" />
              <div className="h-8 bg-gray-100 animate-pulse rounded w-3/4" />
              <div className="h-6 bg-gray-100 animate-pulse rounded w-1/3" />
              <div className="h-24 bg-gray-100 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </AcheteurLayout>
    );
  }

  /* ── Erreur / introuvable ───────────────────────── */
  if (erreur || !produit) {
    return (
      <AcheteurLayout>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20 text-center">
          <SearchX size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#011023] mb-2">Produit introuvable</h2>
          <p className="text-gray-500 mb-6">{erreur ?? "Ce produit n'existe pas ou a été retiré."}</p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 text-[#FC7701] font-semibold hover:underline"
          >
            <ArrowLeft size={16} /> Retour au catalogue
          </Link>
        </div>
      </AcheteurLayout>
    );
  }

  const prixAffiche = produit.prixPromotionnel ?? produit.prix;
  const aPromotion  = !!produit.prixPromotionnel && produit.prixPromotionnel < produit.prix;
  const remise      = aPromotion
    ? Math.round(((produit.prix - prixAffiche) / produit.prix) * 100)
    : 0;

  return (
    <AcheteurLayout>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10">

        {/* Fil d'Ariane */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8 flex-wrap">
          <Link to="/" className="hover:text-[#FC7701] transition-colors">Accueil</Link>
          <ChevronRight size={14} />
          <Link to="/catalogue" className="hover:text-[#FC7701] transition-colors">Catalogue</Link>
          <ChevronRight size={14} />
          <Link
            to={`/catalogue/categorie/${produit.categorie.slug}`}
            className="hover:text-[#FC7701] transition-colors"
          >
            {produit.categorie.nom}
          </Link>
          <ChevronRight size={14} />
          <span className="text-[#011023] font-medium truncate max-w-[200px]">{produit.nom}</span>
        </nav>

        {/* Détail principal */}
        <div className="grid lg:grid-cols-2 gap-10 mb-16">

          {/* Galerie */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
              {produit.photoCouverture ? (
                <img
                  src={produit.photoCouverture}
                  alt={produit.nom}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff size={64} className="text-gray-300" />
                </div>
              )}
            </div>
            {/* Miniatures des variantes photos */}
            {produit.variantesPhotos && produit.variantesPhotos.length > 0 && (
              <div className="flex gap-3 mt-4 flex-wrap">
                {produit.variantesPhotos.flatMap((v) => v.photos).slice(0, 4).map((photo, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:border-[#FC7701] transition-colors"
                  >
                    <img src={photo} alt={`${produit.nom} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#FC7701] uppercase tracking-wide mb-2">
              {produit.categorie.nom}
            </span>
            <h1 className="text-3xl font-black text-[#011023] leading-tight mb-5">{produit.nom}</h1>

            {/* Prix */}
            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-extrabold text-[#011023]">{formatPrix(prixAffiche)}</span>
              {aPromotion && (
                <span className="text-lg text-gray-400 line-through mb-1">{formatPrix(produit.prix)}</span>
              )}
            </div>
            {aPromotion && (
              <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-lg mb-5 w-fit">
                Économisez {remise}%
              </span>
            )}

            <p className="text-gray-500 leading-relaxed mb-8">{produit.description}</p>

            {/* Variantes */}
            {produit.variantes && produit.variantes.length > 0 && (
              <div className="mb-6 space-y-4">
                {produit.variantes.map((v, i) => (
                  <div key={i}>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{v.nom}</p>
                    <div className="flex flex-wrap gap-2">
                      {v.valeurs.map((val, j) => (
                        <span
                          key={j}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-[#011023] font-medium hover:border-[#FC7701] cursor-pointer transition-colors"
                        >
                          {val}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Attributs techniques */}
            {produit.attributs && produit.attributs.length > 0 && (
              <div className="mb-8 bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Caractéristiques</p>
                <div className="space-y-2">
                  {produit.attributs.map((attr, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-500">{attr.nom}</span>
                      <span className="font-semibold text-[#011023]">{attr.valeur}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FC7701]/30 text-sm"
                style={{ background: 'linear-gradient(to right, #FC8900, #FC7700)' }}
              >
                <ShoppingCart size={18} />
                Ajouter au panier
              </button>
              <button
                className="w-14 h-14 flex items-center justify-center rounded-xl border-2 border-gray-200 hover:border-red-300 hover:text-red-400 transition-all"
                aria-label="Ajouter aux favoris"
              >
                <Heart size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Vendeur */}
            {produit.vendeur && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2 uppercase font-semibold tracking-wide">Vendu par</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FC7701]/10 flex items-center justify-center">
                    <Store size={16} className="text-[#FC7701]" />
                  </div>
                  <span className="font-bold text-[#011023]">{produit.vendeur.nomEntreprise}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Produits similaires */}
        {similaires.length > 0 && (
          <div>
            <div className="mb-8">
              <p className="text-[#FC7701] text-xs font-bold uppercase tracking-widest mb-2">Vous aimerez aussi</p>
              <h2 className="text-2xl font-black text-[#011023]">Produits similaires</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similaires.map((p) => (
                <CarteProduit key={p._id} produit={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AcheteurLayout>
  );
}
