import api from '../api';
import type {
  ReponseListeReclamations,
  ReponseReclamation,
  ReponseStatistiquesReclamations,
  StatutReclamation,
  PrioriteReclamation,
  CategorieReclamation,
} from '../../types/admin';

export async function getStatistiquesReclamations(): Promise<ReponseStatistiquesReclamations> {
  const { data } = await api.get('/admin/reclamations/statistiques');
  return data;
}

export async function getReclamations(params?: {
  statut?: StatutReclamation;
  priorite?: PrioriteReclamation;
  categorie?: CategorieReclamation;
  recherche?: string;
  assigneA?: string;
  page?: number;
  limite?: number;
}): Promise<ReponseListeReclamations> {
  const { data } = await api.get('/admin/reclamations', { params });
  return data;
}

export async function getReclamationParId(id: string): Promise<ReponseReclamation> {
  const { data } = await api.get(`/admin/reclamations/${id}`);
  return data;
}

export async function modifierStatutReclamation(
  id: string,
  statut: StatutReclamation,
  raison?: string
): Promise<ReponseReclamation> {
  const { data } = await api.patch(`/admin/reclamations/${id}/statut`, { statut, raison: raison ?? '' });
  return data;
}

export async function ajouterMessage(
  id: string,
  contenu: string,
  piecesJointes?: string[]
): Promise<ReponseReclamation> {
  const { data } = await api.post(`/admin/reclamations/${id}/messages`, {
    contenu,
    piecesJointes: piecesJointes ?? [],
  });
  return data;
}

export async function assignerReclamation(
  id: string,
  adminId: string | null
): Promise<ReponseReclamation> {
  const { data } = await api.patch(`/admin/reclamations/${id}/assigner`, { adminId });
  return data;
}

export async function modifierPriorite(
  id: string,
  priorite: PrioriteReclamation
): Promise<ReponseReclamation> {
  const { data } = await api.patch(`/admin/reclamations/${id}/priorite`, { priorite });
  return data;
}

export async function modifierNotesReclamation(
  id: string,
  notesAdmin: string
): Promise<ReponseReclamation> {
  const { data } = await api.patch(`/admin/reclamations/${id}/notes`, { notesAdmin });
  return data;
}
