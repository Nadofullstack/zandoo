import type {
  ReponseListePublicites, ReponsePublicite, ReponseStatistiquesPublicites,
  StatutPublicite, TypePublicite, EmplacementPublicite, FormulairePublicite,
} from '../../types/admin';

const API_URL = import.meta.env.VITE_API_URL as string;
const optionsBase: RequestInit = { credentials: 'include', headers: { 'Content-Type': 'application/json' } };

async function verifierReponse<T>(res: Response): Promise<T> {
  const d = await res.json();
  if (!res.ok) throw new Error(d.message || 'Erreur serveur.');
  return d as T;
}

export async function getStatistiquesPublicites(): Promise<ReponseStatistiquesPublicites> {
  return verifierReponse(await fetch(`${API_URL}/admin/publicites/statistiques`, optionsBase));
}

export async function getPublicites(params?: {
  statut?: StatutPublicite; type?: TypePublicite;
  emplacement?: EmplacementPublicite; page?: number; limite?: number;
}): Promise<ReponseListePublicites> {
  const qs = new URLSearchParams();
  if (params?.statut)      qs.set('statut',      params.statut);
  if (params?.type)        qs.set('type',        params.type);
  if (params?.emplacement) qs.set('emplacement', params.emplacement);
  if (params?.page)        qs.set('page',        String(params.page));
  if (params?.limite)      qs.set('limite',      String(params.limite));
  return verifierReponse(await fetch(`${API_URL}/admin/publicites?${qs}`, optionsBase));
}

export async function getPubliciteParId(id: string): Promise<ReponsePublicite> {
  return verifierReponse(await fetch(`${API_URL}/admin/publicites/${id}`, optionsBase));
}

export async function creerPublicite(donnees: Partial<FormulairePublicite>): Promise<ReponsePublicite> {
  return verifierReponse(await fetch(`${API_URL}/admin/publicites`, {
    ...optionsBase, method: 'POST', body: JSON.stringify(donnees),
  }));
}

export async function modifierPublicite(id: string, donnees: Partial<FormulairePublicite>): Promise<ReponsePublicite> {
  return verifierReponse(await fetch(`${API_URL}/admin/publicites/${id}`, {
    ...optionsBase, method: 'PUT', body: JSON.stringify(donnees),
  }));
}

export async function supprimerPublicite(id: string): Promise<{ success: boolean; message: string }> {
  return verifierReponse(await fetch(`${API_URL}/admin/publicites/${id}`, {
    ...optionsBase, method: 'DELETE',
  }));
}
