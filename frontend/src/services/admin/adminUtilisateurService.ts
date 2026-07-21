import type {
  ReponseListeUtilisateurs,
  ReponseUtilisateur,
  ReponseStatistiquesUtilisateurs,
  RoleUtilisateur,
  FormulaireUtilisateur,
} from '../../types/admin';

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

/* ── Statistiques ─────────────────────────────────────────────────────────── */
export async function getStatistiquesUtilisateurs(): Promise<ReponseStatistiquesUtilisateurs> {
  const res = await fetch(`${API_URL}/admin/utilisateurs/statistiques`, optionsBase);
  return verifierReponse(res);
}

/* ── Liste paginée ────────────────────────────────────────────────────────── */
export async function getUtilisateurs(params?: {
  role?: RoleUtilisateur | '';
  actif?: 'true' | 'false' | '';
  recherche?: string;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limite?: number;
}): Promise<ReponseListeUtilisateurs> {
  const qs = new URLSearchParams();
  if (params?.role)       qs.set('role',       params.role);
  if (params?.actif)      qs.set('actif',      params.actif);
  if (params?.recherche)  qs.set('recherche',  params.recherche);
  if (params?.dateDebut)  qs.set('dateDebut',  params.dateDebut);
  if (params?.dateFin)    qs.set('dateFin',    params.dateFin);
  if (params?.page)       qs.set('page',       String(params.page));
  if (params?.limite)     qs.set('limite',     String(params.limite));

  const res = await fetch(`${API_URL}/admin/utilisateurs?${qs}`, optionsBase);
  return verifierReponse(res);
}

/* ── Profil complet ───────────────────────────────────────────────────────── */
export async function getUtilisateurParId(id: string): Promise<ReponseUtilisateur> {
  const res = await fetch(`${API_URL}/admin/utilisateurs/${id}`, optionsBase);
  return verifierReponse(res);
}

/* ── Modifier informations de base ───────────────────────────────────────── */
export async function modifierUtilisateur(
  id: string,
  donnees: Partial<FormulaireUtilisateur>
): Promise<ReponseUtilisateur> {
  const res = await fetch(`${API_URL}/admin/utilisateurs/${id}`, {
    ...optionsBase,
    method: 'PUT',
    body: JSON.stringify(donnees),
  });
  return verifierReponse(res);
}

/* ── Activer / Suspendre ─────────────────────────────────────────────────── */
export async function modifierStatutUtilisateur(
  id: string,
  isActive: boolean
): Promise<ReponseUtilisateur> {
  const res = await fetch(`${API_URL}/admin/utilisateurs/${id}/statut`, {
    ...optionsBase,
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
  return verifierReponse(res);
}

/* ── Supprimer ────────────────────────────────────────────────────────────── */
export async function supprimerUtilisateur(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/admin/utilisateurs/${id}`, {
    ...optionsBase,
    method: 'DELETE',
  });
  return verifierReponse(res);
}
