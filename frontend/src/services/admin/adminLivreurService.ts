import api from '../api';
import type {
  ReponseListeLivreurs,
  ReponseLivreur,
  ReponseStatistiquesLivreurs,
  StatutLivreur,
} from '../../types/admin';

export async function getStatistiquesLivreurs(): Promise<ReponseStatistiquesLivreurs> {
  const { data } = await api.get('/admin/livreurs/statistiques');
  return data;
}

export async function getLivreurs(params?: {
  statut?: StatutLivreur;
  vendeurId?: string;
  recherche?: string;
  page?: number;
  limite?: number;
}): Promise<ReponseListeLivreurs> {
  const { data } = await api.get('/admin/livreurs', { params });
  return data;
}

export async function getLivreurParId(id: string): Promise<ReponseLivreur> {
  const { data } = await api.get(`/admin/livreurs/${id}`);
  return data;
}

export async function supprimerLivreur(
  id: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/admin/livreurs/${id}`);
  return data;
}
