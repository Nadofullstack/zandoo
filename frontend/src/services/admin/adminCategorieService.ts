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
