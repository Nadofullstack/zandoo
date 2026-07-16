import type {
  ReponseListeVendeurs,
  ReponseVendeur,
  ReponseStatistiques,
  StatutVendeur,
} from '../types/admin';

const API_URL = import.meta.env.VITE_API_URL as string;

/** Options fetch communes — cookie httpOnly inclus automatiquement */
const optionsBase: RequestInit = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
};

/** Gestion centralisée des erreurs HTTP */
async function verifierReponse<T>(res: Response): Promise<T> {
  const donnees = await res.json();
  if (!res.ok) {
    throw new Error(donnees.message || 'Erreur serveur.');
  }
  return donnees as T;
}

/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Récupère les statistiques des vendeurs (compteurs par statut).
 */
export async function getStatistiquesVendeurs(): Promise<ReponseStatistiques> {
  const res = await fetch(`${API_URL}/admin/vendeurs/statistiques`, optionsBase);
  return verifierReponse<ReponseStatistiques>(res);
}

/**
 * Récupère la liste paginée des vendeurs avec filtres optionnels.
 */
export async function getVendeurs(params?: {
  statut?: StatutVendeur;
  recherche?: string;
  page?: number;
  limite?: number;
}): Promise<ReponseListeVendeurs> {
  const qs = new URLSearchParams();
  if (params?.statut)    qs.set('statut', params.statut);
  if (params?.recherche) qs.set('recherche', params.recherche);
  if (params?.page)      qs.set('page', String(params.page));
  if (params?.limite)    qs.set('limite', String(params.limite));

  const res = await fetch(`${API_URL}/admin/vendeurs?${qs.toString()}`, optionsBase);
  return verifierReponse<ReponseListeVendeurs>(res);
}

/**
 * Récupère le profil complet d'un vendeur par son ID.
 */
export async function getVendeurParId(id: string): Promise<ReponseVendeur> {
  const res = await fetch(`${API_URL}/admin/vendeurs/${id}`, optionsBase);
  return verifierReponse<ReponseVendeur>(res);
}

/**
 * Modifie le statut d'un vendeur (approuve / suspendu / en_attente).
 */
export async function modifierStatutVendeur(
  id: string,
  statut: StatutVendeur,
  raison?: string
): Promise<ReponseVendeur> {
  const res = await fetch(`${API_URL}/admin/vendeurs/${id}/statut`, {
    ...optionsBase,
    method: 'PATCH',
    body: JSON.stringify({ statut, raison: raison ?? '' }),
  });
  return verifierReponse<ReponseVendeur>(res);
}

/**
 * Met à jour les notes internes de l'administrateur.
 */
export async function modifierNotesAdmin(
  id: string,
  notesAdmin: string
): Promise<ReponseVendeur> {
  const res = await fetch(`${API_URL}/admin/vendeurs/${id}/notes`, {
    ...optionsBase,
    method: 'PATCH',
    body: JSON.stringify({ notesAdmin }),
  });
  return verifierReponse<ReponseVendeur>(res);
}
