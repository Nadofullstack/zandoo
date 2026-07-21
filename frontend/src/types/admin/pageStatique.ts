/* ─── Pages statiques ────────────────────────────────────────────────────── */

export interface PageStatique {
  _id: string;
  slug: string;
  titre: string;
  contenu: string;
  metaTitre?: string;
  metaDescription?: string;
  publiee: boolean;
  ordre: number;
  modifiePar?: { _id: string; fullName: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormulairePageStatique {
  slug: string;
  titre: string;
  contenu: string;
  metaTitre: string;
  metaDescription: string;
  publiee: boolean;
  ordre: number;
}

export interface ReponseListePages {
  success: boolean;
  data: { pages: PageStatique[] };
}

export interface ReponsePage {
  success: boolean;
  data: { page: PageStatique };
  message?: string;
}
