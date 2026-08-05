import api from '../api';
import type {
  ReponseListeProduits,
  ReponseProduit,
  ReponseStatistiquesProduits,
  StatutProduit,
} from '../../types/admin';

export async function getStatistiquesProduits(): Promise<ReponseStatistiquesProduits> {
  const { data } = await api.get('/admin/produits/statistiques');
  return data;
}

export async function getProduits(params?: {
  statut?: StatutProduit;
  categorie?: string;
  vendeur?: string;
  recherche?: string;
  page?: number;
  limite?: number;
}): Promise<ReponseListeProduits> {
  const { data } = await api.get('/admin/produits', { params });
  return data;
}

export async function getProduitParId(id: string): Promise<ReponseProduit> {
  const { data } = await api.get(`/admin/produits/${id}`);
  return data;
}

export async function modifierStatutProduit(
  id: string,
  statut: StatutProduit,
  raison?: string
): Promise<ReponseProduit> {
  const { data } = await api.patch(`/admin/produits/${id}/statut`, { statut, raison: raison ?? '' });
  return data;
}

export async function supprimerProduit(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/admin/produits/${id}`);
  return data;
}
