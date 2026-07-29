import type {
  ReponseListeProduits,
  ReponseDetailProduit,
  ReponseCategories,
  FiltresCatalogue,
} from '../../types/acheteur';

const API_URL = import.meta.env.VITE_API_URL as string;

async function verifierReponse<T>(res: Response): Promise<T> {
  const donnees = await res.json();
  if (!res.ok) throw new Error(donnees.message || 'Erreur serveur.');
  return donnees as T;
}

/** Liste paginée de produits avec filtres optionnels */
export async function getProduits(filtres?: FiltresCatalogue): Promise<ReponseListeProduits> {
  const qs = new URLSearchParams();
  if (filtres?.categorie) qs.set('categorie', filtres.categorie);
  if (filtres?.recherche) qs.set('recherche', filtres.recherche);
  if (filtres?.tri)       qs.set('tri',       filtres.tri);
  if (filtres?.prixMin)   qs.set('prixMin',   String(filtres.prixMin));
  if (filtres?.prixMax)   qs.set('prixMax',   String(filtres.prixMax));
  if (filtres?.page)      qs.set('page',      String(filtres.page));
  if (filtres?.limite)    qs.set('limite',    String(filtres.limite));

  const res = await fetch(`${API_URL}/acheteur/produits?${qs}`);
  return verifierReponse(res);
}

/** Détail d'un produit par son slug SEO */
export async function getProduitParSlug(slug: string): Promise<ReponseDetailProduit> {
  const res = await fetch(`${API_URL}/acheteur/produits/${slug}`);
  return verifierReponse(res);
}

/** Liste des catégories avec arborescence */
export async function getCategories(): Promise<ReponseCategories> {
  const res = await fetch(`${API_URL}/acheteur/produits/categories`);
  return verifierReponse(res);
}

/** Produits filtrés par slug de catégorie */
export async function getProduitsParCategorie(
  slug: string,
  filtres?: Omit<FiltresCatalogue, 'categorie'>
): Promise<ReponseListeProduits> {
  const qs = new URLSearchParams();
  if (filtres?.tri)     qs.set('tri',     filtres.tri);
  if (filtres?.prixMin) qs.set('prixMin', String(filtres.prixMin));
  if (filtres?.prixMax) qs.set('prixMax', String(filtres.prixMax));
  if (filtres?.page)    qs.set('page',    String(filtres.page));
  if (filtres?.limite)  qs.set('limite',  String(filtres.limite));

  const res = await fetch(`${API_URL}/acheteur/produits/categories/${slug}/produits?${qs}`);
  return verifierReponse(res);
}

/** Recherche plein texte */
export async function rechercherProduits(
  q: string,
  page = 1,
  limite = 20
): Promise<ReponseListeProduits> {
  const qs = new URLSearchParams({ q, page: String(page), limite: String(limite) });
  const res = await fetch(`${API_URL}/acheteur/produits/recherche?${qs}`);
  return verifierReponse(res);
}
