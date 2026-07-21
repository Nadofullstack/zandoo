import type { Pagination, HistoriqueStatut } from './common';
import type { UtilisateurAdmin } from './utilisateur';

/* ─── Vendeur ────────────────────────────────────────────────────────────── */

export type StatutVendeur = 'en_attente' | 'approuve' | 'suspendu';

export interface DocumentsVendeur {
  rccm?: string | null;
  ifu?: string | null;
  carteIdentite?: string | null;
  autresDocuments?: string[];
}

export interface Vendeur {
  _id: string;
  utilisateur: UtilisateurAdmin;
  nomEntreprise: string;
  typeEntreprise: 'individuel' | 'sarl' | 'sa' | 'autre';
  secteurActivite?: string;
  adresse?: { rue?: string; ville?: string; pays?: string };
  emailContact?: string;
  telephoneContact?: string;
  documents?: DocumentsVendeur;
  statut: StatutVendeur;
  notesAdmin?: string;
  historiqueStatut?: HistoriqueStatut[];
  createdAt: string;
  updatedAt: string;
}

export interface StatistiquesVendeurs {
  enAttente: number;
  approuves: number;
  suspendus: number;
  total: number;
}

export interface ReponseListeVendeurs {
  success: boolean;
  data: { vendeurs: Vendeur[]; pagination: Pagination };
}

export interface ReponseVendeur {
  success: boolean;
  data: { vendeur: Vendeur };
  message?: string;
}

export interface ReponseStatistiques {
  success: boolean;
  data: { statistiques: StatistiquesVendeurs };
}
