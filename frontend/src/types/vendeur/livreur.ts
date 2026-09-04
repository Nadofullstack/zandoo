import type { UtilisateurAdmin } from '../admin/utilisateur';
import type { Pagination, HistoriqueStatut } from '../admin/common';

/* ─── Livreurs vendeur ───────────────────────────────────────────────────── */

export type StatutLivreurVendeur = 'en_attente' | 'actif' | 'suspendu';
export type TypeVehiculeVendeur  = 'moto' | 'velo' | 'voiture' | 'camionnette' | 'autre';

export interface LivreurVendeur {
  _id: string;
  utilisateur: UtilisateurAdmin;
  typeVehicule: TypeVehiculeVendeur | null;
  numeroplaque: string | null;
  villeService: string | null;
  zonelivraison: string | null;
  telephone: string | null;
  statut: StatutLivreurVendeur;
  profilComplete: boolean;
  historiqueStatut?: HistoriqueStatut[];
  createdAt: string;
  updatedAt: string;
}

export interface FormulaireCreationLivreurVendeur {
  nom: string;
  prenom: string;
  email: string;
}

export interface StatistiquesLivreursVendeur {
  enAttente: number;
  actifs: number;
  suspendus: number;
  total: number;
  profilsComplets: number;
}

/* ─── Réponses API ──────────────────────────────────────────────────────── */

export interface ReponseListeLivreursVendeur {
  success: boolean;
  data: { livreurs: LivreurVendeur[]; pagination: Pagination };
}

export interface ReponseLivreurVendeur {
  success: boolean;
  data: { livreur: LivreurVendeur };
  message?: string;
}

export interface ReponseStatistiquesLivreursVendeur {
  success: boolean;
  data: { statistiques: StatistiquesLivreursVendeur };
}

export interface ReponseCreationLivreurVendeur {
  success: boolean;
  message: string;
  data: { livreur: { utilisateurId: string; nomComplet: string; email: string } };
}
