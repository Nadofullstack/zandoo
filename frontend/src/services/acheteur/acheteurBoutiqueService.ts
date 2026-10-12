import api from '../api';
import type {
  ReponseAvisBoutiquePublic,
  ReponseBoutiqueDetail,
  ReponseBoutiques,
  ReponseProduitsBoutique,
  TriBoutiques,
  TriProduitsBoutique,
} from '../../types/acheteur';

/** Retire les paramètres vides pour garder des URL d'API propres */
const nettoyer = <T extends object>(params: T) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));

/** Annuaire des boutiques approuvées. */
export async function getBoutiques(params: {
  recherche?: string; secteur?: string; ville?: string; tri?: TriBoutiques; page?: number; limite?: number;
} = {}): Promise<ReponseBoutiques> {
  const { data } = await api.get('/acheteur/boutiques', { params: nettoyer(params) });
  return data;
}

/** Vitrine d'une boutique (par slug). */
export async function getBoutique(slug: string): Promise<ReponseBoutiqueDetail> {
  const { data } = await api.get(`/acheteur/boutiques/${encodeURIComponent(slug)}`);
  return data;
}

export async function getProduitsBoutique(slug: string, params: {
  categorie?: string; recherche?: string; tri?: TriProduitsBoutique; promo?: boolean; page?: number; limite?: number;
} = {}): Promise<ReponseProduitsBoutique> {
  const { promo, ...reste } = params;
  const { data } = await api.get(`/acheteur/boutiques/${encodeURIComponent(slug)}/produits`, {
    params: nettoyer({ ...reste, promo: promo ? '1' : undefined }),
  });
  return data;
}

export async function getAvisBoutique(slug: string, page = 1): Promise<ReponseAvisBoutiquePublic> {
  const { data } = await api.get(`/acheteur/boutiques/${encodeURIComponent(slug)}/avis`, { params: { page } });
  return data;
}

/** Lien public d'une boutique (slug, ou identifiant pour les boutiques sans slug). */
export const lienBoutique = (b: { slug?: string | null; _id: string }) => `/boutique/${b.slug || b._id}`;
