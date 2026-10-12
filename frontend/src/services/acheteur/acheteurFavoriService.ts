import api from '../api';
import type { ReponseFavoris } from '../../types/acheteur';

/** Produits favoris paginés (du plus récent au plus ancien). */
export async function getMesFavoris(page = 1, limite = 24): Promise<ReponseFavoris> {
  const { data } = await api.get('/acheteur/favoris', { params: { page, limite } });
  return data;
}

/** Identifiants des produits favoris (état des cœurs sur les cartes). */
export async function getIdsFavoris(): Promise<string[]> {
  const { data } = await api.get('/acheteur/favoris/ids');
  return data.data.ids;
}

export async function ajouterFavori(produitId: string): Promise<void> {
  await api.put(`/acheteur/favoris/${produitId}`);
}

export async function retirerFavori(produitId: string): Promise<void> {
  await api.delete(`/acheteur/favoris/${produitId}`);
}
