import type { ReponseListePages, ReponsePage, FormulairePageStatique } from '../types/admin';

const API_URL = import.meta.env.VITE_API_URL as string;
const optionsBase: RequestInit = { credentials: 'include', headers: { 'Content-Type': 'application/json' } };

async function verifierReponse<T>(res: Response): Promise<T> {
  const d = await res.json();
  if (!res.ok) throw new Error(d.message || 'Erreur serveur.');
  return d as T;
}

export async function getPages(): Promise<ReponseListePages> {
  return verifierReponse(await fetch(`${API_URL}/admin/pages-statiques`, optionsBase));
}

export async function getPageParId(id: string): Promise<ReponsePage> {
  return verifierReponse(await fetch(`${API_URL}/admin/pages-statiques/${id}`, optionsBase));
}

export async function creerPage(donnees: Partial<FormulairePageStatique>): Promise<ReponsePage> {
  return verifierReponse(await fetch(`${API_URL}/admin/pages-statiques`, {
    ...optionsBase, method: 'POST', body: JSON.stringify(donnees),
  }));
}

export async function modifierPage(id: string, donnees: Partial<FormulairePageStatique>): Promise<ReponsePage> {
  return verifierReponse(await fetch(`${API_URL}/admin/pages-statiques/${id}`, {
    ...optionsBase, method: 'PUT', body: JSON.stringify(donnees),
  }));
}

export async function supprimerPage(id: string): Promise<{ success: boolean; message: string }> {
  return verifierReponse(await fetch(`${API_URL}/admin/pages-statiques/${id}`, {
    ...optionsBase, method: 'DELETE',
  }));
}
