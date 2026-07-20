import type {
  ReponseListeArticles, ReponseArticle, ReponseStatistiquesArticles,
  StatutArticle, CategorieEditoriale, FormulaireArticle,
} from '../types/admin';

const API_URL = import.meta.env.VITE_API_URL as string;
const optionsBase: RequestInit = { credentials: 'include', headers: { 'Content-Type': 'application/json' } };

async function verifierReponse<T>(res: Response): Promise<T> {
  const d = await res.json();
  if (!res.ok) throw new Error(d.message || 'Erreur serveur.');
  return d as T;
}

export async function getStatistiquesArticles(): Promise<ReponseStatistiquesArticles> {
  return verifierReponse(await fetch(`${API_URL}/admin/articles/statistiques`, optionsBase));
}

export async function getArticles(params?: {
  statut?: StatutArticle; categorieEditoriale?: CategorieEditoriale;
  recherche?: string; page?: number; limite?: number;
}): Promise<ReponseListeArticles> {
  const qs = new URLSearchParams();
  if (params?.statut)              qs.set('statut',              params.statut);
  if (params?.categorieEditoriale) qs.set('categorieEditoriale', params.categorieEditoriale);
  if (params?.recherche)           qs.set('recherche',           params.recherche);
  if (params?.page)                qs.set('page',                String(params.page));
  if (params?.limite)              qs.set('limite',              String(params.limite));
  return verifierReponse(await fetch(`${API_URL}/admin/articles?${qs}`, optionsBase));
}

export async function getArticleParId(id: string): Promise<ReponseArticle> {
  return verifierReponse(await fetch(`${API_URL}/admin/articles/${id}`, optionsBase));
}

export async function creerArticle(donnees: Partial<FormulaireArticle>): Promise<ReponseArticle> {
  return verifierReponse(await fetch(`${API_URL}/admin/articles`, {
    ...optionsBase, method: 'POST', body: JSON.stringify(donnees),
  }));
}

export async function modifierArticle(id: string, donnees: Partial<FormulaireArticle>): Promise<ReponseArticle> {
  return verifierReponse(await fetch(`${API_URL}/admin/articles/${id}`, {
    ...optionsBase, method: 'PUT', body: JSON.stringify(donnees),
  }));
}

export async function supprimerArticle(id: string): Promise<{ success: boolean; message: string }> {
  return verifierReponse(await fetch(`${API_URL}/admin/articles/${id}`, {
    ...optionsBase, method: 'DELETE',
  }));
}
