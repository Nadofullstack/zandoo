import type { Pagination } from './common';

/* ─── Publicités ─────────────────────────────────────────────────────────── */

export type StatutPublicite      = 'brouillon' | 'active' | 'pausee' | 'expiree';
export type TypePublicite        = 'banniere' | 'mise_en_avant_produit' | 'mise_en_avant_vendeur';
export type EmplacementPublicite = 'accueil_haut' | 'accueil_milieu' | 'sidebar' | 'page_categorie' | 'page_produit';

export interface Publicite {
  _id: string;
  titre: string;
  type: TypePublicite;
  emplacement: EmplacementPublicite;
  imageUrl?: string | null;
  lienCible?: string;
  texteAlt?: string;
  produit?: { _id: string; nom: string; reference: string } | null;
  vendeur?: { _id: string; nomEntreprise: string } | null;
  dateDebut: string;
  dateFin: string;
  statut: StatutPublicite;
  ordre: number;
  impressions: number;
  clics: number;
  creePar?: { _id: string; fullName: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormulairePublicite {
  titre: string;
  type: TypePublicite;
  emplacement: EmplacementPublicite;
  imageUrl: string;
  lienCible: string;
  texteAlt: string;
  produit: string;
  vendeur: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutPublicite;
  ordre: number;
}

export interface StatistiquesPublicites {
  brouillons: number;
  actives: number;
  pausees: number;
  expirees: number;
  total: number;
  impressions: number;
  clics: number;
}

export interface ReponseListePublicites {
  success: boolean;
  data: { publicites: Publicite[]; pagination: Pagination };
}

export interface ReponsePublicite {
  success: boolean;
  data: { publicite: Publicite };
  message?: string;
}

export interface ReponseStatistiquesPublicites {
  success: boolean;
  data: { statistiques: StatistiquesPublicites };
}
