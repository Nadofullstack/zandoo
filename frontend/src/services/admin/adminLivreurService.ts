import api from '../api';
import type {
  ReponseListeLivreurs,
  ReponseLivreur,
  ReponseStatistiquesLivreurs,
  ReponseCreationLivreur,
  StatutLivreur,
  FormulaireCreationLivreur,
} from '../../types/admin';

export async function getStatistiquesLivreurs(): Promise<ReponseStatistiquesLivreurs> {
  const { data } = await api.get('/admin/livreurs/statistiques');
  return data;
}

export async function getLivreurs(params?: {
  statut?: StatutLivreur;
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

export async function creerLivreur(
  donnees: FormulaireCreationLivreur
): Promise<ReponseCreationLivreur> {
  const { data } = await api.post('/admin/livreurs', donnees);
  return data;
}

export async function modifierStatutLivreur(
  id: string,
  statut: StatutLivreur,
  raison?: string
): Promise<ReponseLivreur> {
  const { data } = await api.patch(`/admin/livreurs/${id}/statut`, { statut, raison: raison ?? '' });
  return data;
}

export async function renvoyerInvitationLivreur(
  id: string
): Promise<{ success: boolean; message: string; data: { lienActivation: string } }> {
  const { data } = await api.post(`/admin/livreurs/${id}/renvoyer-invitation`);
  return data;
}

export async function supprimerLivreur(
  id: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/admin/livreurs/${id}`);
  return data;
}
