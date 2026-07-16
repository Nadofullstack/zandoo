/* ─── Types partagés pour le panneau d'administration ─────────────────────── */

export type StatutVendeur = 'en_attente' | 'approuve' | 'suspendu';
export type StatutProduit = 'en_attente' | 'approuve' | 'rejete' | 'brouillon';
export type RoleUtilisateur = 'acheteur' | 'vendeur' | 'livreur' | 'admin';

/* ─── Utilisateur ────────────────────────────────────────────────────────── */

export interface UtilisateurAdmin {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: RoleUtilisateur;
  isActive: boolean;
  isVerified: boolean;
  avatar?: string | null;
  googleId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormulaireUtilisateur {
  fullName: string;
  email: string;
  phone: string;
  role: RoleUtilisateur;
  isVerified: boolean;
}

export interface StatistiquesUtilisateurs {
  total: number;
  acheteurs: number;
  vendeurs: number;
  livreurs: number;
  admins: number;
  actifs: number;
  suspendus: number;
}

export interface ReponseListeUtilisateurs {
  success: boolean;
  data: { utilisateurs: UtilisateurAdmin[]; pagination: Pagination };
}

export interface ReponseUtilisateur {
  success: boolean;
  data: { utilisateur: UtilisateurAdmin };
  message?: string;
}

export interface ReponseStatistiquesUtilisateurs {
  success: boolean;
  data: { statistiques: StatistiquesUtilisateurs };
}

export interface HistoriqueStatut {
  _id: string;
  statut: StatutVendeur;
  modifiePar?: { nomComplet: string; email: string } | null;
  raison: string;
  modifieAt: string;
}

export interface DocumentsVendeur {
  rccm?: string | null;
  ifu?: string | null;
  carteIdentite?: string | null;
  autresDocuments?: string[];
}

export interface Vendeur {
  _id: string;
  utilisateur: Utilisateur;
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

/* ─── Catégories ─────────────────────────────────────────────────────────── */

export interface AttributCategorie {
  _id?: string;
  nom: string;
  type: 'texte' | 'liste' | 'nombre' | 'booleen';
  valeurs?: string[];
  requis: boolean;
}

export interface Categorie {
  _id: string;
  nom: string;
  slug: string;
  description?: string;
  parent?: string | null;
  image?: string | null;
  attributs: AttributCategorie[];
  active: boolean;
  ordre: number;
  sousCategories?: Categorie[];
  createdAt: string;
  updatedAt: string;
}

/* ─── Produits ───────────────────────────────────────────────────────────── */

export interface VarianteProduit {
  nom: string;
  valeurs: string[];
}

export interface AttributProduit {
  nom: string;
  valeur: string;
}

export interface HistoriqueStatutProduit {
  _id: string;
  statut: StatutProduit;
  modifiePar?: { fullName: string; email: string } | null;
  raison: string;
  modifieAt: string;
}

export interface Produit {
  _id: string;
  nom: string;
  slug: string;
  description: string;
  reference: string;
  photos: string[];
  video?: string | null;
  categorie: { _id: string; nom: string; slug: string; attributs?: AttributCategorie[] };
  vendeur: { _id: string; nomEntreprise: string };
  prix: number;
  prixPromotionnel?: number | null;
  quantiteDisponible: number;
  enStock: boolean;
  variantes: VarianteProduit[];
  attributs: AttributProduit[];
  statut: StatutProduit;
  motifRejet?: string;
  notesAdmin?: string;
  historiqueStatut?: HistoriqueStatutProduit[];
  createdAt: string;
  updatedAt: string;
}

export interface FormulaireProduiit {
  nom: string;
  description: string;
  reference: string;
  categorie: string;
  vendeur: string;
  prix: string;
  prixPromotionnel: string;
  quantiteDisponible: string;
  enStock: boolean;
  photos: string[];
  video: string;
  variantes: VarianteProduit[];
  attributs: AttributProduit[];
  statut: StatutProduit;
}

/* ─── Pagination & réponses génériques ──────────────────────────────────── */

export interface Pagination {
  total: number;
  page: number;
  limite: number;
  totalPages: number;
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

export interface StatistiquesVendeurs {
  enAttente: number;
  approuves: number;
  suspendus: number;
  total: number;
}

export interface ReponseStatistiques {
  success: boolean;
  data: { statistiques: StatistiquesVendeurs };
}

export interface ReponseListeProduits {
  success: boolean;
  data: { produits: Produit[]; pagination: Pagination };
}

export interface ReponseProduit {
  success: boolean;
  data: { produit: Produit };
  message?: string;
}

export interface StatistiquesProduits {
  enAttente: number;
  approuves: number;
  rejetes: number;
  brouillons: number;
  total: number;
}

export interface ReponseStatistiquesProduits {
  success: boolean;
  data: { statistiques: StatistiquesProduits };
}

export interface ReponseListeCategories {
  success: boolean;
  data: { categories: Categorie[] };
}

export interface ReponseCategorie {
  success: boolean;
  data: { categorie: Categorie };
  message?: string;
}
