import type {
  ReponseListeLivreurs,
  ReponseLivreur,
  ReponseStatistiquesLivreurs,
  ReponseCreationLivreur,
  StatutLivreur,
  FormulaireCreationLivreur,
} from '../../types/admin';

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
 * Statistiques des livreurs (compteurs par statut).
 */
export async function getStatistiquesLivreurs(): Promise<ReponseStatistiquesLivreurs> {
  const res = await fetch(`${API_URL}/admin/livreurs/statistiques`, optionsBase);
  return verifierReponse<ReponseStatistiquesLivreurs>(res);
}

/**
 * Liste paginée des livreurs avec filtres optionnels.
 */
export async function getLivreurs(params?: {
  statut?: StatutLivreur;
  recherche?: string;
  page?: number;
  limite?: number;
}): Promise<ReponseListeLivreurs> {
  const qs = new URLSearchParams();
  if (params?.statut)    qs.set('statut',    params.statut);
  if (params?.recherche) qs.set('recherche', params.recherche);
  if (params?.page)      qs.set('page',      String(params.page));
  if (params?.limite)    qs.set('limite',    String(params.limite));

  const res = await fetch(`${API_URL}/admin/livreurs?${qs.toString()}`, optionsBase);
  return verifierReponse<ReponseListeLivreurs>(res);
}

/**
 * Profil complet d'un livreur par son ID.
 */
export async function getLivreurParId(id: string): Promise<ReponseLivreur> {
  const res = await fetch(`${API_URL}/admin/livreurs/${id}`, optionsBase);
  return verifierReponse<ReponseLivreur>(res);
}

/**
 * Création d'un compte livreur (admin).
 */
export async function creerLivreur(
  donnees: FormulaireCreationLivreur
): Promise<ReponseCreationLivreur> {
  const res = await fetch(`${API_URL}/admin/livreurs`, {
    ...optionsBase,
    method: 'POST',
    body:   JSON.stringify(donnees),
  });
  return verifierReponse<ReponseCreationLivreur>(res);
}

/**
 * Modifie le statut d'un livreur.
 */
export async function modifierStatutLivreur(
  id: string,
  statut: StatutLivreur,
  raison?: string
): Promise<ReponseLivreur> {
  const res = await fetch(`${API_URL}/admin/livreurs/${id}/statut`, {
    ...optionsBase,
    method: 'PATCH',
    body:   JSON.stringify({ statut, raison: raison ?? '' }),
  });
  return verifierReponse<ReponseLivreur>(res);
}

/**
 * Renvoie l'email d'invitation avec un nouveau token.
 */
export async function renvoyerInvitationLivreur(
  id: string
): Promise<{ success: boolean; message: string; data: { lienActivation: string } }> {
  const res = await fetch(`${API_URL}/admin/livreurs/${id}/renvoyer-invitation`, {
    ...optionsBase,
    method: 'POST',
  });
  return verifierReponse(res);
}

/**
 * Supprime un livreur et son compte utilisateur.
 */
export async function supprimerLivreur(
  id: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/admin/livreurs/${id}`, {
    ...optionsBase,
    method: 'DELETE',
  });
  return verifierReponse(res);
}
