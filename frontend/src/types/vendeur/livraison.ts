/* ─── Types — politique de livraison du vendeur ─────────────────────────── */

export interface ZoneLivraison {
  _id?: string;
  nom: string;
  villes: string[];
  tarif: number;
  delaiMin: number;
  delaiMax: number;
}

export interface PolitiqueLivraison {
  configuree: boolean;
  domicile: {
    actif: boolean;
    zones: ZoneLivraison[];
    tarifAutresVilles: number | null;
    delaiAutresVillesMin: number;
    delaiAutresVillesMax: number;
    gratuiteDes: number | null;
  };
  retrait: {
    actif: boolean;
    adresse: string;
    ville: string;
    horaires: string;
    instructions: string;
  };
}

export interface ReponsePolitiqueLivraison {
  success: boolean;
  message?: string;
  data: {
    livraison: PolitiqueLivraison;
    adresseBoutique: { rue?: string; ville?: string; pays?: string } | null;
  };
}
