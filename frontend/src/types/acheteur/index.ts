/* ─── Types acheteur ─────────────────────────────────────────────────────── */

export interface CategorieResumee {
  _id: string;
  nom: string;
  slug: string;
  image?: string;
  sousCategories?: CategorieResumee[];
}

export interface VendeurResume {
  _id: string;
  nomEntreprise: string;
  logoUrl?: string;
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
}

export interface ProduitDetail extends ProduitResume {
  description: string;
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
  vendeur: { _id: string; nomEntreprise: string; logoUrl?: string };
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

export interface ReponseAccueil {
  success: boolean;
  data: {
    categories: CategorieResumee[];
    nouveautes: ProduitResume[];
    bestSellers: ProduitResume[];
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
