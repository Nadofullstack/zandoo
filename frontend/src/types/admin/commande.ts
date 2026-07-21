import type { Pagination, HistoriqueStatut } from './common';

/* ─── Commandes ──────────────────────────────────────────────────────────── */

export type StatutCommande  = 'en_attente' | 'payee' | 'expediee' | 'livree' | 'annulee';
export type StatutPaiement  = 'en_attente' | 'paye' | 'echoue' | 'rembourse';
export type MethodePaiement = 'mobile_money' | 'carte_bancaire' | 'virement' | 'especes' | 'autre';

export interface LigneCommande {
  _id: string;
  produit: { _id: string; nom: string; reference: string; photos: string[]; slug: string } | null;
  vendeur: { _id: string; nomEntreprise: string; emailContact?: string } | null;
  nomProduit: string;
  photoProduit?: string | null;
  reference: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  variante?: string;
}

export interface AdresseCommande {
  nomComplet: string;
  telephone?: string;
  rue?: string;
  ville: string;
  pays?: string;
  codePostal?: string;
  instructions?: string;
}

export interface PaiementCommande {
  methode: MethodePaiement;
  statut: StatutPaiement;
  reference?: string;
  montant: number;
  devise: string;
  payeAt?: string | null;
}

export interface HistoriqueStatutCommande extends HistoriqueStatut {
  statut: StatutCommande;
}

export interface Commande {
  _id: string;
  numero: string;
  acheteur: { _id: string; fullName: string; email: string; phone: string; avatar?: string | null };
  lignes: LigneCommande[];
  sousTotal: number;
  fraisLivraison: number;
  remise: number;
  total: number;
  devise: string;
  adresseLivraison: AdresseCommande;
  adresseFacturation?: AdresseCommande | null;
  paiement: PaiementCommande;
  statut: StatutCommande;
  notesClient?: string;
  notesAdmin?: string;
  payeeAt?: string | null;
  expedieeAt?: string | null;
  livreeAt?: string | null;
  annuleeAt?: string | null;
  historiqueStatut?: HistoriqueStatutCommande[];
  createdAt: string;
  updatedAt: string;
}

export interface StatistiquesCommandes {
  enAttente: number;
  payees: number;
  expediees: number;
  livrees: number;
  annulees: number;
  total: number;
  chiffreAffaires: number;
}

export interface ReponseListeCommandes {
  success: boolean;
  data: { commandes: Commande[]; pagination: Pagination };
}

export interface ReponseCommande {
  success: boolean;
  data: { commande: Commande };
  message?: string;
}

export interface ReponseStatistiquesCommandes {
  success: boolean;
  data: { statistiques: StatistiquesCommandes };
}
