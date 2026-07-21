import type { Pagination, HistoriqueStatut } from './common';
import type { StatutCommande } from './commande';

/* ─── Réclamations ───────────────────────────────────────────────────────── */

export type StatutReclamation = 'ouvert' | 'en_cours' | 'en_attente_reponse' | 'resolu' | 'ferme';
export type PrioriteReclamation = 'basse' | 'normale' | 'haute' | 'urgente';
export type CategorieReclamation =
  | 'produit_non_recu'
  | 'produit_defectueux'
  | 'produit_non_conforme'
  | 'remboursement'
  | 'vendeur'
  | 'paiement'
  | 'compte'
  | 'autre';

export interface MessageTicket {
  _id: string;
  auteur: { _id: string; fullName: string; email: string; avatar?: string | null; role: string } | null;
  roleAuteur: 'acheteur' | 'vendeur' | 'admin';
  contenu: string;
  piecesJointes?: string[];
  lu: boolean;
  luAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HistoriqueStatutReclamation extends HistoriqueStatut {
  statut: StatutReclamation;
}

export interface Reclamation {
  _id: string;
  numero: string;
  utilisateur: { _id: string; fullName: string; email: string; phone?: string; avatar?: string | null; role: string };
  roleUtilisateur: 'acheteur' | 'vendeur';
  commande?: { _id: string; numero: string; total: number; statut: StatutCommande } | null;
  categorie: CategorieReclamation;
  sujet: string;
  description: string;
  priorite: PrioriteReclamation;
  statut: StatutReclamation;
  assigneA?: { _id: string; fullName: string; email: string; avatar?: string | null } | null;
  messages?: MessageTicket[];
  notesAdmin?: string;
  resoluAt?: string | null;
  fermeAt?: string | null;
  historiqueStatut?: HistoriqueStatutReclamation[];
  createdAt: string;
  updatedAt: string;
}

export interface StatistiquesReclamations {
  ouverts: number;
  enCours: number;
  enAttente: number;
  resolus: number;
  fermes: number;
  total: number;
  urgents: number;
}

export interface ReponseListeReclamations {
  success: boolean;
  data: { reclamations: Reclamation[]; pagination: Pagination };
}

export interface ReponseReclamation {
  success: boolean;
  data: { reclamation: Reclamation };
  message?: string;
}

export interface ReponseStatistiquesReclamations {
  success: boolean;
  data: { statistiques: StatistiquesReclamations };
}
