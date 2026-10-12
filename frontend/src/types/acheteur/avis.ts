/* ─── Types — avis clients ──────────────────────────────────────────────── */

import type { Pagination } from './index';

export interface ReponseVendeurAvis {
  texte: string;
  reponduAt: string | null;
}

/** Avis tel qu'affiché publiquement sur une fiche produit */
export interface AvisPublic {
  _id: string;
  note: number;
  titre?: string;
  commentaire?: string;
  auteur: string;          // « Prénom N. »
  achatVerifie: boolean;
  createdAt: string;
  modifie: boolean;
  reponseVendeur: ReponseVendeurAvis | null;
}

/** Avis de l'utilisateur connecté (pour modification) */
export interface MonAvis {
  _id: string;
  produit: string;
  note: number;
  titre?: string;
  commentaire?: string;
  createdAt: string;
}

export interface ResumeNotes {
  moyenne: number;
  total: number;
  repartition: Record<1 | 2 | 3 | 4 | 5, number>;
}

export type TriAvis = 'recents' | 'note_haute' | 'note_basse';

export interface SaisieAvis {
  note: number;
  titre: string;
  commentaire: string;
}

/* ── Réponses API ─────────────────────────────────────────────────────────── */

export interface ReponseAvisProduit {
  success: boolean;
  data: { avis: AvisPublic[]; resume: ResumeNotes; pagination: Pagination };
}

export interface ReponseMonAvisProduit {
  success: boolean;
  data: { peutEvaluer: boolean; raison: string | null; monAvis: MonAvis | null };
}

export interface ReponseMesAvisCommande {
  success: boolean;
  data: { avis: Record<string, MonAvis> };
}
