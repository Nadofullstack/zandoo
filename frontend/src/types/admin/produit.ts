import type { Pagination, HistoriqueStatut } from './common';
import type { AttributCategorie } from './categorie';

/* ─── Produits ───────────────────────────────────────────────────────────── */

export type StatutProduit = 'en_stock' | 'en_rupture' | 'faible';

export interface VariantePhoto {
  nom: string;
  photos: string[];
}

export interface VarianteProduit {
  nom: string;
  valeurs: string[];
}

export interface AttributProduit {
  nom: string;
  valeur: string;
}

export interface HistoriqueStatutProduit extends HistoriqueStatut {
  statut: StatutProduit;
}

export interface Produit {
  _id: string;
  nom: string;
  slug: string;
  description: string;
  reference: string;
  photoCouverture?: string | null;
  variantesPhotos: VariantePhoto[];
  video?: string | null;
  categorie: { _id: string; nom: string; slug: string; attributs?: AttributCategorie[] };
  vendeur: { _id: string; nomEntreprise: string };
  prix: number;
  prixPromotionnel?: number | null;
  quantiteDisponible: number;
  enStock: boolean;
  variantes: VarianteProduit[];
  attributs: AttributProduit[];
  statut: StatutProduit;
  motifRejet?: string;
  notesAdmin?: string;
  historiqueStatut?: HistoriqueStatutProduit[];
  createdAt: string;
  updatedAt: string;
}

export interface FormulaireProduiit {
  nom: string;
  description: string;
  reference: string;
  categorie: string;
  vendeur: string;
  prix: string;
  prixPromotionnel: string;
  quantiteDisponible: string;
  enStock: boolean;
  photoCouverture?: string;
  variantesPhotos: VariantePhoto[];
  video: string;
  variantes: VarianteProduit[];
  attributs: AttributProduit[];
  statut: StatutProduit;
}

export interface StatistiquesProduits {
  enStock: number;
  enRupture: number;
  faible: number;
  total: number;
}

export interface ReponseListeProduits {
  success: boolean;
  data: { produits: Produit[]; pagination: Pagination };
}

export interface ReponseProduit {
  success: boolean;
  data: { produit: Produit };
  message?: string;
}

export interface ReponseStatistiquesProduits {
  success: boolean;
  data: { statistiques: StatistiquesProduits };
}
