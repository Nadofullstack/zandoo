import api from '../api';
import type { ReponseListePages, ReponsePage, FormulairePageStatique } from '../../types/admin';

export async function getPages(): Promise<ReponseListePages> {
  const { data } = await api.get('/admin/pages-statiques');
  return data;
}

export async function getPageParId(id: string): Promise<ReponsePage> {
  const { data } = await api.get(`/admin/pages-statiques/${id}`);
  return data;
}

export async function creerPage(donnees: Partial<FormulairePageStatique>): Promise<ReponsePage> {
  const { data } = await api.post('/admin/pages-statiques', donnees);
  return data;
}

export async function modifierPage(
  id: string,
  donnees: Partial<FormulairePageStatique>
): Promise<ReponsePage> {
  const { data } = await api.put(`/admin/pages-statiques/${id}`, donnees);
  return data;
}

export async function supprimerPage(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/admin/pages-statiques/${id}`);
  return data;
}
