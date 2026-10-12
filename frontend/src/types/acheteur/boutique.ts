/* ─── Types — pages publiques des boutiques ─────────────────────────────── */

import type { Pagination, ProduitResume } from './index';
import type { AvisPublic } from './avis';

export type TriBoutiques = 'populaires' | 'note' | 'recentes' | 'nom';
export type TriProduitsBoutique = 'recent' | 'prix_asc' | 'prix_desc' | 'note';

/** Boutique dans l'annuaire */
export interface BoutiqueResume {
  _id: string;
  slug?: string | null;
  nomEntreprise: string;
  logo?: string | null;
  banniere?: string | null;
  secteurActivite?: string;
  ville?: string;
  description: string;
  createdAt: string;
  nombreProduits: number;
  /** Jusqu'à 3 photos de produits récents */
  apercu: string[];
  noteMoyenne: number;
  nombreAvis: number;
  retrait: boolean;
}

export interface ZoneLivraisonPublique {
  nom: string;
  villes: string[];
  tarif: number;
  delaiMin: number;
  delaiMax: number;
}

export interface BoutiqueDetail {
  _id: string;
  slug: string;
  nomEntreprise: string;
  logo?: string | null;
  banniere?: string | null;
  description: string;
  secteurActivite: string;
  ville: string;
  membreDepuis: string;
  nombreProduits: number;
  enPromotion: number;
  noteMoyenne: number;
  nombreAvis: number;
  categories: { _id: string; nom: string; slug: string; nombre: number }[];
  livraison: {
    configuree: boolean;
    domicile: boolean;
    zones: ZoneLivraisonPublique[];
    autresVilles: boolean;
    gratuiteDes: number | null;
    retrait: { adresse: string; ville: string; horaires?: string } | null;
  };
}

export interface AvisBoutiquePublic extends AvisPublic {
  produit: { _id: string; nom: string; slug: string; photoCouverture?: string } | null;
}

/* ── Réponses API ─────────────────────────────────────────────────────────── */

export interface ReponseBoutiques {
  success: boolean;
  data: {
    boutiques: BoutiqueResume[];
    filtres: { secteurs: string[]; villes: string[] };
    pagination: Pagination;
  };
}

export interface ReponseBoutiqueDetail {
  success: boolean;
  data: { boutique: BoutiqueDetail };
}

export interface ReponseProduitsBoutique {
  success: boolean;
  data: { produits: ProduitResume[]; pagination: Pagination };
}

export interface ReponseAvisBoutiquePublic {
  success: boolean;
  data: { avis: AvisBoutiquePublic[]; pagination: Pagination };
}
