/* ─── Types — commandes côté acheteur ───────────────────────────────────── */

import type { Pagination } from './index';
import type { LivraisonCommande } from './livraison';

export type StatutCommande =
  | 'en_attente'
  | 'payee'
  | 'en_preparation'
  | 'expediee'
  | 'livree'
  | 'annulee'
  | 'remboursee';

/** Onglets de la page « Mes commandes » (regroupements de statuts côté API) */
export type GroupeStatut = 'en_cours' | 'livree' | 'annulee';

export type MethodePaiement = 'mobile_money' | 'carte_bancaire' | 'virement' | 'especes' | 'autre';

export interface LigneCommande {
  _id: string;
  produit: { _id: string; nom: string; slug: string; photoCouverture?: string; reference?: string } | string | null;
  nomProduit: string;
  photoProduit?: string | null;
  reference?: string;
  variante?: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export interface AdresseLivraison {
  nomComplet: string;
  telephone?: string;
  quartier?: string;
  rue?: string;
  ville: string;
  pays?: string;
  instructions?: string;
}

export interface BoutiqueCommande {
  _id: string;
  nomEntreprise: string;
  logo?: string;
  slug?: string;
  emailContact?: string;
  telephoneContact?: string;
}

export interface CommandeResume {
  _id: string;
  numero: string;
  groupeCommandeId: string;
  vendeur: BoutiqueCommande | null;
  lignes: LigneCommande[];
  sousTotal: number;
  fraisLivraison: number;
  remise: number;
  total: number;
  devise: string;
  statut: StatutCommande;
  paiement: { methode: MethodePaiement; statut: 'en_attente' | 'paye' | 'echoue' | 'rembourse' };
  createdAt: string;
  peutAnnuler: boolean;
  /** Absent sur les commandes antérieures au module livraison */
  livraison?: LivraisonCommande;
}

export type EtatEtapeSuivi = 'terminee' | 'actuelle' | 'a_venir' | 'annulee';

export interface EtapeSuivi {
  statut: StatutCommande;
  libelle: string;
  etat: EtatEtapeSuivi;
  date: string | null;
  raison?: string | null;
}

export interface CommandeDetail extends CommandeResume {
  adresseLivraison: AdresseLivraison;
  notesClient?: string;
  livreur: { nom: string; telephone: string } | null;
  suivi: EtapeSuivi[];
}

export interface AutreCommandeGroupe {
  _id: string;
  numero: string;
  statut: StatutCommande;
  total: number;
  vendeur: { _id: string; nomEntreprise: string; logo?: string } | null;
}

export interface CompteursCommandes {
  toutes: number;
  en_cours: number;
  livree: number;
  annulee: number;
}

export interface FiltresMesCommandes {
  groupe?: GroupeStatut;
  recherche?: string;
  page?: number;
  limite?: number;
}

/* ── Réponses API ─────────────────────────────────────────────────────────── */

export interface ReponseMesCommandes {
  success: boolean;
  data: { commandes: CommandeResume[]; compteurs: CompteursCommandes; pagination: Pagination };
}

export interface ReponseDetailCommande {
  success: boolean;
  data: { commande: CommandeDetail; autresCommandes: AutreCommandeGroupe[] };
}

export interface ResumeCommandes {
  compteurs: CompteursCommandes;
  /** Somme des commandes en cours et livrées (hors annulées/remboursées) */
  montantTotal: number;
}

export interface ReponseResumeCommandes {
  success: boolean;
  data: ResumeCommandes;
}
