import api from '../api';
import type {
  ReponseListePages,
  ReponsePage,
  PageStatique,
  ReponseListeArticles,
  ReponseArticle,
  ReponseStatistiquesArticles,
  StatutArticle,
  Article,
} from '../../types/admin';

/* ── Pages statiques ─────────────────────────────────────────────────── */

export async function getPages(): Promise<ReponseListePages> {
  const { data } = await api.get('/admin/pages');
  return data;
}

export async function getPageParSlug(slug: string): Promise<ReponsePage> {
  const { data } = await api.get(`/admin/pages/${slug}`);
  return data;
}

export async function creerPage(
  donnees: Pick<PageStatique, 'slug' | 'titre'> & Partial<PageStatique>
): Promise<ReponsePage> {
  const { data } = await api.post('/admin/pages', donnees);
  return data;
}

export async function sauvegarderPage(
  slug: string,
  donnees: Partial<PageStatique>
): Promise<ReponsePage> {
  const { data } = await api.put(`/admin/pages/${slug}`, donnees);
  return data;
}

export async function supprimerPage(slug: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/admin/pages/${slug}`);
  return data;
}

/* ── Articles ────────────────────────────────────────────────────────── */

export async function getStatistiquesArticles(): Promise<ReponseStatistiquesArticles> {
  const { data } = await api.get('/admin/articles/statistiques');
  return data;
}

export async function getArticles(params?: {
  statut?: StatutArticle;
  recherche?: string;
  page?: number;
  limite?: number;
}): Promise<ReponseListeArticles> {
  const { data } = await api.get('/admin/articles', { params });
  return data;
}

export async function getArticleParId(id: string): Promise<ReponseArticle> {
  const { data } = await api.get(`/admin/articles/${id}`);
  return data;
}

export async function creerArticle(donnees: Partial<Article>): Promise<ReponseArticle> {
  const { data } = await api.post('/admin/articles', donnees);
  return data;
}

export async function modifierArticle(
  id: string,
  donnees: Partial<Article>
): Promise<ReponseArticle> {
  const { data } = await api.put(`/admin/articles/${id}`, donnees);
  return data;
}

export async function supprimerArticle(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/admin/articles/${id}`);
  return data;
}
