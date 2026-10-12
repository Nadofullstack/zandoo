/* ─── Types — avis clients reçus par la boutique ─────────────────────────── */

export interface AvisBoutique {
  _id: string;
  note: number;
  titre?: string;
  commentaire?: string;
  auteur: string;
  produit: { _id: string; nom: string; slug: string; photoCouverture?: string } | null;
  createdAt: string;
  reponseVendeur: { texte: string; reponduAt: string | null } | null;
}

export interface StatistiquesAvisBoutique {
  moyenne: number;
  total: number;
  sansReponse: number;
}

export interface ReponseAvisBoutique {
  success: boolean;
  data: {
    avis: AvisBoutique[];
    statistiques: StatistiquesAvisBoutique;
    pagination: { total: number; page: number; limite: number; totalPages: number };
  };
}
