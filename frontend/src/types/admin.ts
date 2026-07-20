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

/* ─── Commandes ──────────────────────────────────────────────────────────── */

export type StatutCommande = 'en_attente' | 'payee' | 'expediee' | 'livree' | 'annulee';
export type StatutPaiement = 'en_attente' | 'paye' | 'echoue' | 'rembourse';
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

export interface HistoriqueStatutCommande {
  _id: string;
  statut: StatutCommande;
  modifiePar?: { fullName: string; email: string } | null;
  raison: string;
  modifieAt: string;
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

export interface HistoriqueStatutReclamation {
  _id: string;
  statut: StatutReclamation;
  modifiePar?: { fullName: string; email: string } | null;
  raison: string;
  modifieAt: string;
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

/* ─── Publicités ─────────────────────────────────────────────────────────── */

export type StatutPublicite    = 'brouillon' | 'active' | 'pausee' | 'expiree';
export type TypePublicite      = 'banniere' | 'mise_en_avant_produit' | 'mise_en_avant_vendeur';
export type EmplacementPublicite = 'accueil_haut' | 'accueil_milieu' | 'sidebar' | 'page_categorie' | 'page_produit';

export interface Publicite {
  _id: string;
  titre: string;
  type: TypePublicite;
  emplacement: EmplacementPublicite;
  imageUrl?: string | null;
  lienCible?: string;
  texteAlt?: string;
  produit?: { _id: string; nom: string; reference: string } | null;
  vendeur?: { _id: string; nomEntreprise: string } | null;
  dateDebut: string;
  dateFin: string;
  statut: StatutPublicite;
  ordre: number;
  impressions: number;
  clics: number;
  creePar?: { _id: string; fullName: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormulairePublicite {
  titre: string;
  type: TypePublicite;
  emplacement: EmplacementPublicite;
  imageUrl: string;
  lienCible: string;
  texteAlt: string;
  produit: string;
  vendeur: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutPublicite;
  ordre: number;
}

export interface StatistiquesPublicites {
  brouillons: number;
  actives: number;
  pausees: number;
  expirees: number;
  total: number;
  impressions: number;
  clics: number;
}

export interface ReponseListePublicites {
  success: boolean;
  data: { publicites: Publicite[]; pagination: Pagination };
}

export interface ReponsePublicite {
  success: boolean;
  data: { publicite: Publicite };
  message?: string;
}

export interface ReponseStatistiquesPublicites {
  success: boolean;
  data: { statistiques: StatistiquesPublicites };
}

/* ─── Pages statiques ────────────────────────────────────────────────────── */

export interface PageStatique {
  _id: string;
  slug: string;
  titre: string;
  contenu: string;
  metaTitre?: string;
  metaDescription?: string;
  publiee: boolean;
  ordre: number;
  modifiePar?: { _id: string; fullName: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormulairePageStatique {
  slug: string;
  titre: string;
  contenu: string;
  metaTitre: string;
  metaDescription: string;
  publiee: boolean;
  ordre: number;
}

export interface ReponseListePages {
  success: boolean;
  data: { pages: PageStatique[] };
}

export interface ReponsePage {
  success: boolean;
  data: { page: PageStatique };
  message?: string;
}

/* ─── Articles / Blog ────────────────────────────────────────────────────── */

export type StatutArticle           = 'brouillon' | 'publie' | 'archive';
export type CategorieEditoriale     = 'actualite' | 'conseil' | 'mise_a_jour' | 'autre';

export interface Article {
  _id: string;
  titre: string;
  slug: string;
  resume?: string;
  contenu: string;
  imageCouverture?: string | null;
  categorieEditoriale: CategorieEditoriale;
  tags: string[];
  statut: StatutArticle;
  publieAt?: string | null;
  auteur?: { _id: string; fullName: string; email: string; avatar?: string | null } | null;
  metaTitre?: string;
  metaDescription?: string;
  vues: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormulaireArticle {
  titre: string;
  resume: string;
  contenu: string;
  imageCouverture: string;
  categorieEditoriale: CategorieEditoriale;
  tags: string;
  statut: StatutArticle;
  publieAt: string;
  metaTitre: string;
  metaDescription: string;
}

export interface StatistiquesArticles {
  brouillons: number;
  publies: number;
  archives: number;
  total: number;
  vues: number;
}

export interface ReponseListeArticles {
  success: boolean;
  data: { articles: Article[]; pagination: Pagination };
}

export interface ReponseArticle {
  success: boolean;
  data: { article: Article };
  message?: string;
}

export interface ReponseStatistiquesArticles {
  success: boolean;
  data: { statistiques: StatistiquesArticles };
}
