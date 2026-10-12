/* ─── Types — adresses et livraison côté acheteur ───────────────────────── */

export type ModeLivraison = 'domicile' | 'retrait';

/** Adresse du carnet d'adresses de l'utilisateur */
export interface AdresseEnregistree {
  _id: string;
  libelle?: string;
  nomComplet: string;
  telephone: string;
  ville: string;
  quartier?: string;
  rue?: string;
  pays?: string;
  instructions?: string;
  parDefaut: boolean;
}

/** Champs saisis dans le formulaire d'adresse */
export type ChampsAdresse = Omit<AdresseEnregistree, '_id' | 'parDefaut'>;

export interface PointRetrait {
  adresse: string;
  ville: string;
  horaires?: string;
  instructions?: string;
}

/** Une option de livraison calculée par l'API pour une boutique */
export interface OptionLivraison {
  disponible: boolean;
  frais?: number;
  gratuite?: boolean;
  zone?: string;
  delaiMin?: number | null;
  delaiMax?: number | null;
  raison?: string;
  resteAvantGratuite?: number;
  pointRetrait?: PointRetrait;
}

/** Options de livraison d'une boutique du panier */
export interface OptionsBoutique {
  vendeur: { _id: string; nomEntreprise: string };
  sousTotal: number;
  nombreArticles: number;
  options: Record<ModeLivraison, OptionLivraison>;
}

/** Livraison retenue sur une commande (snapshot) */
export interface LivraisonCommande {
  mode: ModeLivraison;
  zone?: string;
  delaiMin?: number | null;
  delaiMax?: number | null;
  pointRetrait?: PointRetrait;
}

/* ── Réponses API ─────────────────────────────────────────────────────────── */

export interface ReponseAdresses {
  success: boolean;
  message?: string;
  data: { adresses: AdresseEnregistree[]; adresse?: AdresseEnregistree };
}

export interface ReponseOptionsLivraison {
  success: boolean;
  data: { boutiques: OptionsBoutique[] };
}
