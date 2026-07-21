/* ─── Types communs partagés entre les domaines admin ────────────────────── */

export type RoleUtilisateur = 'acheteur' | 'vendeur' | 'livreur' | 'admin';

export interface Pagination {
  total: number;
  page: number;
  limite: number;
  totalPages: number;
}

/**
 * Entrée d'historique de changement de statut.
 * Réutilisée par Vendeur, Livreur, Produit, Commande, Réclamation.
 */
export interface HistoriqueStatut {
  _id: string;
  statut: string;
  modifiePar?: { nomComplet?: string; fullName?: string; email: string } | null;
  raison: string;
  modifieAt: string;
}
