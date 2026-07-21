import type { Pagination } from './common';

/* ─── Articles / Blog ────────────────────────────────────────────────────── */

export type StatutArticle       = 'brouillon' | 'publie' | 'archive';
export type CategorieEditoriale = 'actualite' | 'conseil' | 'mise_a_jour' | 'autre';

export interface Article {
  _id: string;
  titre: string;
  slug: string;
  resume?: string;
  contenu: string;
  imageCouverture?: string | null;
  categorieEditoriale: CategorieEditoriale;
  tags: string[];
  statut: StatutArticle;
  publieAt?: string | null;
  auteur?: { _id: string; fullName: string; email: string; avatar?: string | null } | null;
  metaTitre?: string;
  metaDescription?: string;
  vues: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormulaireArticle {
  titre: string;
  resume: string;
  contenu: string;
  imageCouverture: string;
  categorieEditoriale: CategorieEditoriale;
  tags: string;
  statut: StatutArticle;
  publieAt: string;
  metaTitre: string;
  metaDescription: string;
}

export interface StatistiquesArticles {
  brouillons: number;
  publies: number;
  archives: number;
  total: number;
  vues: number;
}

export interface ReponseListeArticles {
  success: boolean;
  data: { articles: Article[]; pagination: Pagination };
}

export interface ReponseArticle {
  success: boolean;
  data: { article: Article };
  message?: string;
}

export interface ReponseStatistiquesArticles {
  success: boolean;
  data: { statistiques: StatistiquesArticles };
}
