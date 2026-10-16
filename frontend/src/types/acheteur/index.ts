/* ─── Types acheteur ─────────────────────────────────────────────────────── */

export interface CategorieResumee {
  _id: string;
  nom: string;
  slug: string;
  icone?: string;
  image?: string;
  sousCategories?: CategorieResumee[];
}

export interface VendeurResume {
  _id: string;
  nomEntreprise: string;
  logo?: string | null;
  /** Absent pour les boutiques créées avant la génération automatique des slugs */
  slug?: string | null;
}

export interface ProduitResume {
  _id: string;
  nom: string;
  slug: string;
  photoCouverture?: string;
  variantesPhotos?: { nom: string; photos: string[] }[];
  prix: number;
  prixPromotionnel?: number;
  categorie: { _id: string; nom: string; slug: string };
  vendeur: { _id: string; nomEntreprise: string };
  enStock?: boolean;
  statut?: 'en_stock' | 'faible' | 'en_rupture';
  /** Note moyenne des avis publiés (0 si aucun avis) */
  noteMoyenne?: number;
  nombreAvis?: number;
}

export interface ProduitDetail extends ProduitResume {
  description: string;
  /** Stock disponible (limite le sélecteur de quantité) */
  quantiteDisponible?: number;
  reference?: string;
  attributs?: { nom: string; valeur: string }[];
  variantes?: { nom: string; valeurs: string[] }[];
  categorie: { _id: string; nom: string; slug: string; attributs?: unknown[] };
  vendeur: VendeurResume;
}

export interface Pagination {
  total: number;
  page: number;
  limite: number;
  totalPages: number;
}

/* ── Panier ───────────────────────────────────────────────────────────────── */

export interface ProduitPanier {
  _id: string;
  nom: string;
  slug: string;
  photoCouverture?: string;
  prix: number;
  prixPromotionnel?: number;
  quantiteDisponible: number;
  enStock: boolean;
  categorie: { _id: string; nom: string; slug: string };
}

export interface LignePanier {
  _id: string;
  produit: ProduitPanier;
  vendeur: { _id: string; nomEntreprise: string; logo?: string | null };
  quantite: number;
  variante: string;
}

export interface Panier {
  _id: string;
  lignes: LignePanier[];
  total: number;
  nombreArticles: number;
}

export interface ReponsePanier {
  success: boolean;
  message?: string;
  data: { panier: Panier };
}

/* ── Réponses API ─────────────────────────────────────────────────────────── */

/* ── Vitrine de l'accueil : publicités et promotions ─────────────────────── */

export type TypePublicite = 'banniere' | 'mise_en_avant_produit' | 'mise_en_avant_vendeur';

/** Campagne publicitaire telle que diffusée côté acheteur */
export interface PublicitePublique {
  _id: string;
  type: TypePublicite;
  emplacement: 'accueil_haut' | 'accueil_milieu';
  imageUrl: string;
  /** Lien interne (« /produit/… ») ou externe (« https://… ») */
  lien: string;
  texteAlt: string;
  accroche?: string;
  description?: string;
  libelleBouton?: string;
  produit: { nom: string; prix: number; prixPromotionnel: number | null } | null;
  vendeur: { nomEntreprise: string; logo: string | null } | null;
}

/** Produit en promotion, avec le pourcentage de remise calculé par l'API */
export interface ProduitPromotion extends ProduitResume {
  remise: number;
}

export interface ReponseAccueil {
  success: boolean;
  data: {
    categories: CategorieResumee[];
    nouveautes: ProduitResume[];
    bestSellers: ProduitResume[];
    publicites: { haut: PublicitePublique[]; milieu: PublicitePublique[] };
    promotions: ProduitPromotion[];
  };
}

export interface ReponseListeProduits {
  success: boolean;
  data: {
    produits: ProduitResume[];
    pagination: Pagination;
    categorie?: CategorieResumee;
    terme?: string;
  };
}

export interface ReponseDetailProduit {
  success: boolean;
  data: {
    produit: ProduitDetail;
    similaires: ProduitResume[];
  };
}

export interface ReponseCategories {
  success: boolean;
  data: { categories: CategorieResumee[] };
}

/* ── Paramètres de filtre catalogue ──────────────────────────────────────── */

export type TriCatalogue = 'recent' | 'prix_asc' | 'prix_desc' | 'nom_asc';

export interface FiltresCatalogue {
  categorie?: string;
  recherche?: string;
  tri?: TriCatalogue;
  prixMin?: number;
  prixMax?: number;
  page?: number;
  limite?: number;
}

/* ── Commandes ────────────────────────────────────────────────────────────── */

export * from './commande';
export * from './livraison';

/* ── Favoris ──────────────────────────────────────────────────────────────── */

export interface ProduitFavori extends ProduitResume {
  ajouteAuxFavorisLe: string;
}

export interface ReponseFavoris {
  success: boolean;
  data: { produits: ProduitFavori[]; pagination: Pagination };
}
export * from './avis';

export interface ReponsePromotions {
  success: boolean;
  data: { produits: ProduitPromotion[]; pagination: Pagination };
}
export * from './boutique';
