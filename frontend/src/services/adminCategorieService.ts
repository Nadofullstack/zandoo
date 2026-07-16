import type {
  ReponseListeCategories,
  ReponseCategorie,
  Categorie,
} from '../types/admin';

const API_URL = import.meta.env.VITE_API_URL as string;

const optionsBase: RequestInit = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
};

async function verifierReponse<T>(res: Response): Promise<T> {
  const donnees = await res.json();
  if (!res.ok) throw new Error(donnees.message || 'Erreur serveur.');
  return donnees as T;
}

export async function getCategories(): Promise<ReponseListeCategories> {
  const res = await fetch(`${API_URL}/admin/categories`, optionsBase);
  return verifierReponse(res);
}

export async function getCategoriesPlates(): Promise<ReponseListeCategories> {
  const res = await fetch(`${API_URL}/admin/categories/liste-plate`, optionsBase);
  return verifierReponse(res);
}

export async function getCategorieParId(id: string): Promise<ReponseCategorie> {
  const res = await fetch(`${API_URL}/admin/categories/${id}`, optionsBase);
  return verifierReponse(res);
}

export async function creerCategorie(
  donnees: Partial<Omit<Categorie, '_id' | 'createdAt' | 'updatedAt' | 'sousCategories'>>
): Promise<ReponseCategorie> {
  const res = await fetch(`${API_URL}/admin/categories`, {
    ...optionsBase,
    method: 'POST',
    body: JSON.stringify(donnees),
  });
  return verifierReponse(res);
}

export async function modifierCategorie(
  id: string,
  donnees: Partial<Omit<Categorie, '_id' | 'createdAt' | 'updatedAt' | 'sousCategories'>>
): Promise<ReponseCategorie> {
  const res = await fetch(`${API_URL}/admin/categories/${id}`, {
    ...optionsBase,
    method: 'PUT',
    body: JSON.stringify(donnees),
  });
  return verifierReponse(res);
}

export async function supprimerCategorie(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/admin/categories/${id}`, {
    ...optionsBase,
    method: 'DELETE',
  });
  return verifierReponse(res);
}
