import api from '../api';
import type {
  ReponseListeCategories,
  ReponseCategorie,
  Categorie,
} from '../../types/admin';

export async function getCategories(): Promise<ReponseListeCategories> {
  const { data } = await api.get('/admin/categories');
  return data;
}

export async function getCategoriesPlates(): Promise<ReponseListeCategories> {
  const { data } = await api.get('/admin/categories/liste-plate');
  return data;
}

export async function getCategorieParId(id: string): Promise<ReponseCategorie> {
  const { data } = await api.get(`/admin/categories/${id}`);
  return data;
}

export async function creerCategorie(
  donnees: Partial<Omit<Categorie, '_id' | 'createdAt' | 'updatedAt' | 'sousCategories'>>
): Promise<ReponseCategorie> {
  const { data } = await api.post('/admin/categories', donnees);
  return data;
}

export async function modifierCategorie(
  id: string,
  donnees: Partial<Omit<Categorie, '_id' | 'createdAt' | 'updatedAt' | 'sousCategories'>>
): Promise<ReponseCategorie> {
  const { data } = await api.put(`/admin/categories/${id}`, donnees);
  return data;
}

export async function supprimerCategorie(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/admin/categories/${id}`);
  return data;
}
