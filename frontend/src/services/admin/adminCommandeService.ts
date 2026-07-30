import api from '../api';
import type {
  ReponseListeCommandes,
  ReponseCommande,
  ReponseStatistiquesCommandes,
  StatutCommande,
} from '../../types/admin';

export async function getStatistiquesCommandes(): Promise<ReponseStatistiquesCommandes> {
  const { data } = await api.get('/admin/commandes/statistiques');
  return data;
}

export async function getCommandes(params?: {
  statut?: StatutCommande;
  recherche?: string;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limite?: number;
}): Promise<ReponseListeCommandes> {
  const { data } = await api.get('/admin/commandes', { params });
  return data;
}

export async function getCommandeParId(id: string): Promise<ReponseCommande> {
  const { data } = await api.get(`/admin/commandes/${id}`);
  return data;
}

export async function modifierStatutCommande(
  id: string,
  statut: StatutCommande,
  raison?: string
): Promise<ReponseCommande> {
  const { data } = await api.patch(`/admin/commandes/${id}/statut`, { statut, raison: raison ?? '' });
  return data;
}

export async function modifierNotesCommande(
  id: string,
  notesAdmin: string
): Promise<ReponseCommande> {
  const { data } = await api.patch(`/admin/commandes/${id}/notes`, { notesAdmin });
  return data;
}
