import type { Pagination, HistoriqueStatut } from './common';
import type { UtilisateurAdmin } from './utilisateur';

/* ─── Livreurs ───────────────────────────────────────────────────────────── */

export type StatutLivreur = 'en_attente' | 'actif' | 'suspendu';
export type TypeVehicule  = 'moto' | 'velo' | 'voiture' | 'camionnette' | 'autre';

export interface Livreur {
  _id: string;
  utilisateur: UtilisateurAdmin;
  typeVehicule: TypeVehicule | null;
  numeroplaque: string | null;
  villeService: string | null;
  zonelivraison: string | null;
  telephone: string | null;
  statut: StatutLivreur;
  profilComplete: boolean;
  notesAdmin?: string;
  historiqueStatut?: HistoriqueStatut[];
  createdAt: string;
  updatedAt: string;
}

export interface FormulaireCreationLivreur {
  nom: string;
  prenom: string;
  email: string;
}

export interface FormulaireProfilLivreur {
  telephone: string;
  typeVehicule: TypeVehicule;
  numeroplaque: string;
  villeService: string;
  zonelivraison: string;
}

export interface StatistiquesLivreurs {
  enAttente: number;
  actifs: number;
  suspendus: number;
  total: number;
  profilsComplets: number;
}

export interface ReponseListeLivreurs {
  success: boolean;
  data: { livreurs: Livreur[]; pagination: Pagination };
}

export interface ReponseLivreur {
  success: boolean;
  data: { livreur: Livreur };
  message?: string;
}

export interface ReponseStatistiquesLivreurs {
  success: boolean;
  data: { statistiques: StatistiquesLivreurs };
}

export interface ReponseCreationLivreur {
  success: boolean;
  message: string;
  data: { livreur: { utilisateurId: string; nomComplet: string; email: string; lienActivation: string } };
}

export interface ReponseVerificationToken {
  success: boolean;
  data: { nomComplet: string; email: string; expireAt: string };
}
