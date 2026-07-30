import api from '../api';
import type {
  ReponseListeVendeurs,
  ReponseVendeur,
  ReponseStatistiques,
  StatutVendeur,
} from '../../types/admin';

export async function getStatistiquesVendeurs(): Promise<ReponseStatistiques> {
  const { data } = await api.get('/admin/vendeurs/statistiques');
  return data;
}

export async function getVendeurs(params?: {
  statut?: StatutVendeur;
  recherche?: string;
  page?: number;
  limite?: number;
}): Promise<ReponseListeVendeurs> {
  const { data } = await api.get('/admin/vendeurs', { params });
  return data;
}

export async function getVendeurParId(id: string): Promise<ReponseVendeur> {
  const { data } = await api.get(`/admin/vendeurs/${id}`);
  return data;
}

export async function modifierStatutVendeur(
  id: string,
  statut: StatutVendeur,
  raison?: string
): Promise<ReponseVendeur> {
  const { data } = await api.patch(`/admin/vendeurs/${id}/statut`, { statut, raison: raison ?? '' });
  return data;
}

export async function modifierNotesAdmin(
  id: string,
  notesAdmin: string
): Promise<ReponseVendeur> {
  const { data } = await api.patch(`/admin/vendeurs/${id}/notes`, { notesAdmin });
  return data;
}
