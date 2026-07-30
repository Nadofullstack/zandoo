import api from '../api';
import type {
  ReponseListeProduits,
  ReponseDetailProduit,
  ReponseCategories,
  FiltresCatalogue,
} from '../../types/acheteur';

export async function getProduits(filtres?: FiltresCatalogue): Promise<ReponseListeProduits> {
  const { data } = await api.get('/acheteur/produits', { params: filtres });
  return data;
}

export async function getProduitParSlug(slug: string): Promise<ReponseDetailProduit> {
  const { data } = await api.get(`/acheteur/produits/${slug}`);
  return data;
}

export async function getCategories(): Promise<ReponseCategories> {
  const { data } = await api.get('/acheteur/produits/categories');
  return data;
}

export async function getProduitsParCategorie(
  slug: string,
  filtres?: Omit<FiltresCatalogue, 'categorie'>
): Promise<ReponseListeProduits> {
  const { data } = await api.get(`/acheteur/produits/categories/${slug}/produits`, { params: filtres });
  return data;
}

export async function rechercherProduits(
  q: string,
  page = 1,
  limite = 20
): Promise<ReponseListeProduits> {
  const { data } = await api.get('/acheteur/produits/recherche', { params: { q, page, limite } });
  return data;
}
