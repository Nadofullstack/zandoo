import api from '../api';
import type {
  ReponseListeArticles, ReponseArticle, ReponseStatistiquesArticles,
  StatutArticle, CategorieEditoriale, FormulaireArticle,
} from '../../types/admin';

export async function getStatistiquesArticles(): Promise<ReponseStatistiquesArticles> {
  const { data } = await api.get('/admin/articles/statistiques');
  return data;
}

export async function getArticles(params?: {
  statut?: StatutArticle;
  categorieEditoriale?: CategorieEditoriale;
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

export async function creerArticle(donnees: Partial<FormulaireArticle>): Promise<ReponseArticle> {
  const { data } = await api.post('/admin/articles', donnees);
  return data;
}

export async function modifierArticle(
  id: string,
  donnees: Partial<FormulaireArticle>
): Promise<ReponseArticle> {
  const { data } = await api.put(`/admin/articles/${id}`, donnees);
  return data;
}

export async function supprimerArticle(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/admin/articles/${id}`);
  return data;
}
