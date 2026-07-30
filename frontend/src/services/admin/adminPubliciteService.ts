import api from '../api';
import type {
  ReponseListePublicites, ReponsePublicite, ReponseStatistiquesPublicites,
  StatutPublicite, TypePublicite, EmplacementPublicite, FormulairePublicite,
} from '../../types/admin';

export async function getStatistiquesPublicites(): Promise<ReponseStatistiquesPublicites> {
  const { data } = await api.get('/admin/publicites/statistiques');
  return data;
}

export async function getPublicites(params?: {
  statut?: StatutPublicite;
  type?: TypePublicite;
  emplacement?: EmplacementPublicite;
  page?: number;
  limite?: number;
}): Promise<ReponseListePublicites> {
  const { data } = await api.get('/admin/publicites', { params });
  return data;
}

export async function getPubliciteParId(id: string): Promise<ReponsePublicite> {
  const { data } = await api.get(`/admin/publicites/${id}`);
  return data;
}

export async function creerPublicite(donnees: Partial<FormulairePublicite>): Promise<ReponsePublicite> {
  const { data } = await api.post('/admin/publicites', donnees);
  return data;
}

export async function modifierPublicite(
  id: string,
  donnees: Partial<FormulairePublicite>
): Promise<ReponsePublicite> {
  const { data } = await api.put(`/admin/publicites/${id}`, donnees);
  return data;
}

export async function supprimerPublicite(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/admin/publicites/${id}`);
  return data;
}
