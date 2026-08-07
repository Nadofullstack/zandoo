/* ─── Types espace vendeur ─────────────────────────────────────────────── */

import type { StatutProduit, VarianteProduit, VariantePhoto } from '../admin/produit';

export type { StatutProduit, VarianteProduit, VariantePhoto };

/* ── Inscription / statut ─────────────────────────────────────────────── */

export type StatutInscription = 'en_attente' | 'approuve' | 'suspendu';

export interface StatutVendeurInscription {
  _id: string;
  statut: StatutInscription;
  nomEntreprise: string;
  conditionsAcceptees: boolean;
  createdAt: string;
}

export interface PayloadInscription {
  nomEntreprise: string;
  typeEntreprise: 'individuel'|'organisation'|'autre';
  secteurActivite: string;
  adresse: { rue?: string; ville?: string; pays?: string };
  emailContact: string;
  telephoneContact: string;
  conditionsAcceptees: boolean;
}

/* ── Boutique ─────────────────────────────────────────────────────────── */

export interface Boutique {
  _id: string;
  nomEntreprise: string;
  typeEntreprise: string;
  secteurActivite?: string;
  adresse?: { rue?: string; ville?: string; pays?: string };
  emailContact?: string;
  telephoneContact?: string;
  logo?: string | null;
  banniere?: string | null;
  descriptionBoutique?: string;
  statut: StatutInscription;
  slug?: string | null;
  createdAt: string;
}

/* ── Tableau de bord ──────────────────────────────────────────────────── */

export interface StatsProduitsDashboard {
  total: number;
  enStock: number;
  faible: number;
  enRupture: number;
}

export interface StatsCommandesDashboard {
  total: number;
  parStatut: {
    en_attente: number;
    payee: number;
    expediee: number;
    livree: number;
    annulee: number;
  };
  dernieres: CommandeResumee[];
}

export interface CommandeResumee {
  _id: string;
  numero: string;
  statut: string;
  total: number;
  createdAt: string;
  acheteur?: { fullName: string; email: string };
}

export interface DashboardData {
  produits: StatsProduitsDashboard;
  commandes: StatsCommandesDashboard;
  chiffreAffaires: number;
}

export interface StatVentesJour {
  _id: { annee: number; mois: number; jour: number };
  nombreCommandes: number;
}

/* ── Produits vendeur ─────────────────────────────────────────────────── */

export interface ProduitVendeur {
  _id: string;
  nom: string;
  slug: string;
  description: string;
  reference: string;
  photoCouverture?: string | null;
  variantesPhotos: VariantePhoto[];
  video?: string | null;
  categorie: { _id: string; nom: string; slug: string };
  prix: number;
  prixPromotionnel?: number | null;
  quantiteDisponible: number;
  enStock: boolean;
  variantes: VarianteProduit[];
  statut: StatutProduit;
  createdAt: string;
}

export interface StatistiquesProduits {
  enStock: number;
  enRupture: number;
  faible: number;
  total: number;
}

/* ── Commandes vendeur ────────────────────────────────────────────────── */

export type StatutCommande = 'en_attente' | 'payee' | 'en_preparation' | 'expediee' | 'livree' | 'annulee';

export interface LigneCommande {
  produit: { _id: string; nom: string; photoCouverture?: string | null } | null;
  /** Snapshot du nom au moment de la commande */
  nomProduit: string;
  /** Snapshot de la photo au moment de la commande */
  photoProduit?: string | null;
  reference?: string;
  variante?: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  vendeur: string;
}

export interface CommandeVendeur {
  _id: string;
  numero: string;
  statut: StatutCommande;
  total: number;
  lignes: LigneCommande[];
  acheteur?: { fullName: string; email: string; phone?: string };
  createdAt: string;
}

/* ── Promotions ───────────────────────────────────────────────────────── */

export interface ProduitPromotion {
  _id: string;
  nom: string;
  reference: string;
  prix: number;
  prixPromotionnel?: number | null;
  photoCouverture?: string | null;
  statut: StatutProduit;
}

/* ── Réponses API ─────────────────────────────────────────────────────── */

export interface ReponseBoutique {
  success: boolean;
  data: { vendeur: Boutique };
  message?: string;
}

export interface ReponseDashboard {
  success: boolean;
  data: DashboardData;
}

export interface ReponseStatVentes {
  success: boolean;
  data: { statsVentes: StatVentesJour[] };
}

export interface ReponseProduits {
  success: boolean;
  data: {
    produits: ProduitVendeur[];
    pagination: { total: number; page: number; limite: number; totalPages: number };
  };
}

export interface ReponseProduit {
  success: boolean;
  data: { produit: ProduitVendeur };
  message?: string;
}

export interface ReponseStatistiquesProduits {
  success: boolean;
  data: { statistiques: StatistiquesProduits };
}

export interface ReponseCommandes {
  success: boolean;
  data: {
    commandes: CommandeVendeur[];
    pagination: { total: number; page: number; limite: number; totalPages: number };
  };
}

export interface ReponseCommande {
  success: boolean;
  data: { commande: CommandeVendeur };
  message?: string;
}

export interface StatistiquesCommandesVendeur {
  enAttente: number;
  enPreparation: number;
  expediees: number;
  livrees: number;
  annulees: number;
  total: number;
  chiffreAffaires: number;
}

export interface ReponseStatistiquesCommandesVendeur {
  success: boolean;
  data: { statistiques: StatistiquesCommandesVendeur };
}

export interface ReponsePromotions {
  success: boolean;
  data: { produits: ProduitPromotion[] };
}

export interface ReponseInscription {
  success: boolean;
  message: string;
  data?: { vendeur: StatutVendeurInscription };
}

export interface ReponseStatutInscription {
  success: boolean;
  data: { vendeur: StatutVendeurInscription | null };
}
