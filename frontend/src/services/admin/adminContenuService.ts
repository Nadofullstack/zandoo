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

const API_URL = import.meta.env.VITE_API_URL as string;
const optionsBase: RequestInit = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
};

async function verifierReponse<T>(res: Response): Promise<T> {
  const d = await res.json();
  if (!res.ok) throw new Error(d.message || 'Erreur serveur.');
  return d as T;
}

/* ── Pages statiques ─────────────────────────────────────────────────── */
export async function getPages(): Promise<ReponseListePages> {
  const res = await fetch(`${API_URL}/admin/pages`, optionsBase);
  return verifierReponse<ReponseListePages>(res);
}

export async function getPageParSlug(slug: string): Promise<ReponsePage> {
  const res = await fetch(`${API_URL}/admin/pages/${slug}`, optionsBase);
  return verifierReponse<ReponsePage>(res);
}

export async function creerPage(
  donnees: Pick<PageStatique, 'slug' | 'titre'> & Partial<PageStatique>
): Promise<ReponsePage> {
  const res = await fetch(`${API_URL}/admin/pages`, {
    ...optionsBase, method: 'POST',
    body: JSON.stringify(donnees),
  });
  return verifierReponse<ReponsePage>(res);
}

export async function sauvegarderPage(
  slug: string, donnees: Partial<PageStatique>
): Promise<ReponsePage> {
  const res = await fetch(`${API_URL}/admin/pages/${slug}`, {
    ...optionsBase, method: 'PUT',
    body: JSON.stringify(donnees),
  });
  return verifierReponse<ReponsePage>(res);
}

export async function supprimerPage(slug: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/admin/pages/${slug}`, {
    ...optionsBase, method: 'DELETE',
  });
  return verifierReponse(res);
}

/* ── Articles ────────────────────────────────────────────────────────── */
export async function getStatistiquesArticles(): Promise<ReponseStatistiquesArticles> {
  const res = await fetch(`${API_URL}/admin/articles/statistiques`, optionsBase);
  return verifierReponse<ReponseStatistiquesArticles>(res);
}

export async function getArticles(params?: {
  statut?: StatutArticle;
  recherche?: string;
  page?: number;
  limite?: number;
}): Promise<ReponseListeArticles> {
  const qs = new URLSearchParams();
  if (params?.statut)    qs.set('statut',    params.statut);
  if (params?.recherche) qs.set('recherche', params.recherche);
  if (params?.page)      qs.set('page',      String(params.page));
  if (params?.limite)    qs.set('limite',    String(params.limite));

  const res = await fetch(`${API_URL}/admin/articles?${qs}`, optionsBase);
  return verifierReponse<ReponseListeArticles>(res);
}

export async function getArticleParId(id: string): Promise<ReponseArticle> {
  const res = await fetch(`${API_URL}/admin/articles/${id}`, optionsBase);
  return verifierReponse<ReponseArticle>(res);
}

export async function creerArticle(donnees: Partial<Article>): Promise<ReponseArticle> {
  const res = await fetch(`${API_URL}/admin/articles`, {
    ...optionsBase, method: 'POST',
    body: JSON.stringify(donnees),
  });
  return verifierReponse<ReponseArticle>(res);
}

export async function modifierArticle(id: string, donnees: Partial<Article>): Promise<ReponseArticle> {
  const res = await fetch(`${API_URL}/admin/articles/${id}`, {
    ...optionsBase, method: 'PUT',
    body: JSON.stringify(donnees),
  });
  return verifierReponse<ReponseArticle>(res);
}

export async function supprimerArticle(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/admin/articles/${id}`, {
    ...optionsBase, method: 'DELETE',
  });
  return verifierReponse(res);
}
