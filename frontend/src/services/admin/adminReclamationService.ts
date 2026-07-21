import type {
  ReponseListeReclamations,
  ReponseReclamation,
  ReponseStatistiquesReclamations,
  StatutReclamation,
  PrioriteReclamation,
  CategorieReclamation,
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

/* ── Statistiques ─────────────────────────────────────────────────────── */
export async function getStatistiquesReclamations(): Promise<ReponseStatistiquesReclamations> {
  const res = await fetch(`${API_URL}/admin/reclamations/statistiques`, optionsBase);
  return verifierReponse<ReponseStatistiquesReclamations>(res);
}

/* ── Liste paginée ────────────────────────────────────────────────────── */
export async function getReclamations(params?: {
  statut?: StatutReclamation;
  priorite?: PrioriteReclamation;
  categorie?: CategorieReclamation;
  recherche?: string;
  assigneA?: string;
  page?: number;
  limite?: number;
}): Promise<ReponseListeReclamations> {
  const qs = new URLSearchParams();
  if (params?.statut)    qs.set('statut',    params.statut);
  if (params?.priorite)  qs.set('priorite',  params.priorite);
  if (params?.categorie) qs.set('categorie', params.categorie);
  if (params?.recherche) qs.set('recherche', params.recherche);
  if (params?.assigneA)  qs.set('assigneA',  params.assigneA);
  if (params?.page)      qs.set('page',      String(params.page));
  if (params?.limite)    qs.set('limite',    String(params.limite));

  const res = await fetch(`${API_URL}/admin/reclamations?${qs.toString()}`, optionsBase);
  return verifierReponse<ReponseListeReclamations>(res);
}

/* ── Détail réclamation ───────────────────────────────────────────────── */
export async function getReclamationParId(id: string): Promise<ReponseReclamation> {
  const res = await fetch(`${API_URL}/admin/reclamations/${id}`, optionsBase);
  return verifierReponse<ReponseReclamation>(res);
}

/* ── Changer statut ───────────────────────────────────────────────────── */
export async function modifierStatutReclamation(
  id: string,
  statut: StatutReclamation,
  raison?: string
): Promise<ReponseReclamation> {
  const res = await fetch(`${API_URL}/admin/reclamations/${id}/statut`, {
    ...optionsBase,
    method: 'PATCH',
    body: JSON.stringify({ statut, raison: raison ?? '' }),
  });
  return verifierReponse<ReponseReclamation>(res);
}

/* ── Ajouter un message ───────────────────────────────────────────────── */
export async function ajouterMessage(
  id: string,
  contenu: string,
  piecesJointes?: string[]
): Promise<ReponseReclamation> {
  const res = await fetch(`${API_URL}/admin/reclamations/${id}/messages`, {
    ...optionsBase,
    method: 'POST',
    body: JSON.stringify({ contenu, piecesJointes: piecesJointes ?? [] }),
  });
  return verifierReponse<ReponseReclamation>(res);
}

/* ── Assigner un admin ────────────────────────────────────────────────── */
export async function assignerReclamation(
  id: string,
  adminId: string | null
): Promise<ReponseReclamation> {
  const res = await fetch(`${API_URL}/admin/reclamations/${id}/assigner`, {
    ...optionsBase,
    method: 'PATCH',
    body: JSON.stringify({ adminId }),
  });
  return verifierReponse<ReponseReclamation>(res);
}

/* ── Changer priorité ─────────────────────────────────────────────────── */
export async function modifierPriorite(
  id: string,
  priorite: PrioriteReclamation
): Promise<ReponseReclamation> {
  const res = await fetch(`${API_URL}/admin/reclamations/${id}/priorite`, {
    ...optionsBase,
    method: 'PATCH',
    body: JSON.stringify({ priorite }),
  });
  return verifierReponse<ReponseReclamation>(res);
}

/* ── Notes admin ──────────────────────────────────────────────────────── */
export async function modifierNotesReclamation(
  id: string,
  notesAdmin: string
): Promise<ReponseReclamation> {
  const res = await fetch(`${API_URL}/admin/reclamations/${id}/notes`, {
    ...optionsBase,
    method: 'PATCH',
    body: JSON.stringify({ notesAdmin }),
  });
  return verifierReponse<ReponseReclamation>(res);
}
