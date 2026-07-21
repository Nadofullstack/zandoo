/* ─── Catégories ─────────────────────────────────────────────────────────── */

export interface AttributCategorie {
  _id?: string;
  nom: string;
  type: 'texte' | 'liste' | 'nombre' | 'booleen';
  valeurs?: string[];
  requis: boolean;
}

export interface Categorie {
  _id: string;
  nom: string;
  slug: string;
  description?: string;
  parent?: string | null;
  image?: string | null;
  attributs: AttributCategorie[];
  active: boolean;
  ordre: number;
  sousCategories?: Categorie[];
  createdAt: string;
  updatedAt: string;
}

export interface ReponseListeCategories {
  success: boolean;
  data: { categories: Categorie[] };
}

export interface ReponseCategorie {
  success: boolean;
  data: { categorie: Categorie };
  message?: string;
}
