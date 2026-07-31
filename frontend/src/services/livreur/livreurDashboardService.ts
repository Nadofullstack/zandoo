import api from '../api';

/* ── Types ─────────────────────────────────────────────────────────────────── */

export interface AdresseLivraison {
  nomComplet: string;
  telephone?: string;
  rue?: string;
  ville: string;
  pays?: string;
  instructions?: string;
}

export interface CommandeLivreur {
  _id: string;
  numero: string;
  statut: 'expediee' | 'livree' | 'annulee' | 'payee';
  total: number;
  adresseLivraison: AdresseLivraison;
  lignes: { nomProduit: string; quantite: number; photoProduit?: string }[];
  createdAt: string;
  updatedAt: string;
  livreeAt?: string;
  annuleeAt?: string;
}

export interface StatistiquesLivreur {
  enCours: number;
  livrees: number;
  livreesAujourdhui: number;
}

export interface ReponseTableauDeBord {
  success: boolean;
  data: {
    statistiques: StatistiquesLivreur;
    livraisonsAujourdhui: CommandeLivreur[];
  };
}

export interface ReponseListeCommandes {
  success: boolean;
  data: {
    commandes: CommandeLivreur[];
    pagination: { total: number; page: number; limite: number; totalPages: number };
  };
}

/* ── Appels API ─────────────────────────────────────────────────────────────── */

export async function getTableauDeBord(): Promise<ReponseTableauDeBord> {
  const { data } = await api.get('/livreur/tableau-de-bord');
  return data;
}

export async function getMesLivraisons(page = 1): Promise<ReponseListeCommandes> {
  const { data } = await api.get('/livreur/commandes', { params: { page, limite: 20 } });
  return data;
}

export async function getHistoriqueLivraisons(page = 1, statut?: string): Promise<ReponseListeCommandes> {
  const { data } = await api.get('/livreur/commandes/historique', {
    params: { page, limite: 20, ...(statut ? { statut } : {}) },
  });
  return data;
}

export async function marquerLivree(commandeId: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.patch(`/livreur/commandes/${commandeId}/livree`);
  return data;
}
