import api from '../api';
import type { ReponseListeCategories, ReponseCategorie, Categorie } from '../../types/admin';

export async function getCategoriesPlates(): Promise<ReponseListeCategories> {
  const { data } = await api.get('/vendeur/categories');
  return data;
}

export async function creerCategorie(
  donnees: Partial<Omit<Categorie, '_id' | 'createdAt' | 'updatedAt' | 'sousCategories'>>
): Promise<ReponseCategorie> {
  const { data } = await api.post('/vendeur/categories', donnees);
  return data;
}
