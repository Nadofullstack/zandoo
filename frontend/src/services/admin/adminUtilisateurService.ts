import api from '../api';
import type {
  ReponseListeUtilisateurs,
  ReponseUtilisateur,
  ReponseStatistiquesUtilisateurs,
  RoleUtilisateur,
  FormulaireUtilisateur,
} from '../../types/admin';

export async function getStatistiquesUtilisateurs(): Promise<ReponseStatistiquesUtilisateurs> {
  const { data } = await api.get('/admin/utilisateurs/statistiques');
  return data;
}

export async function getUtilisateurs(params?: {
  role?: RoleUtilisateur | '';
  actif?: 'true' | 'false' | '';
  recherche?: string;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limite?: number;
}): Promise<ReponseListeUtilisateurs> {
  const { data } = await api.get('/admin/utilisateurs', { params });
  return data;
}

export async function getUtilisateurParId(id: string): Promise<ReponseUtilisateur> {
  const { data } = await api.get(`/admin/utilisateurs/${id}`);
  return data;
}

export async function modifierUtilisateur(
  id: string,
  donnees: Partial<FormulaireUtilisateur>
): Promise<ReponseUtilisateur> {
  const { data } = await api.put(`/admin/utilisateurs/${id}`, donnees);
  return data;
}

export async function modifierStatutUtilisateur(
  id: string,
  isActive: boolean
): Promise<ReponseUtilisateur> {
  const { data } = await api.patch(`/admin/utilisateurs/${id}/statut`, { isActive });
  return data;
}

export async function supprimerUtilisateur(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/admin/utilisateurs/${id}`);
  return data;
}
