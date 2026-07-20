import type {
  ReponseListeCommandes,
  ReponseCommande,
  ReponseStatistiquesCommandes,
  StatutCommande,
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

/* ── Statistiques ─────────────────────────────────────────────────────── */
export async function getStatistiquesCommandes(): Promise<ReponseStatistiquesCommandes> {
  const res = await fetch(`${API_URL}/admin/commandes/statistiques`, optionsBase);
  return verifierReponse<ReponseStatistiquesCommandes>(res);
}

/* ── Liste paginée ────────────────────────────────────────────────────── */
export async function getCommandes(params?: {
  statut?: StatutCommande;
  recherche?: string;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limite?: number;
}): Promise<ReponseListeCommandes> {
  const qs = new URLSearchParams();
  if (params?.statut)    qs.set('statut',    params.statut);
  if (params?.recherche) qs.set('recherche', params.recherche);
  if (params?.dateDebut) qs.set('dateDebut', params.dateDebut);
  if (params?.dateFin)   qs.set('dateFin',   params.dateFin);
  if (params?.page)      qs.set('page',      String(params.page));
  if (params?.limite)    qs.set('limite',    String(params.limite));

  const res = await fetch(`${API_URL}/admin/commandes?${qs.toString()}`, optionsBase);
  return verifierReponse<ReponseListeCommandes>(res);
}

/* ── Détail commande ──────────────────────────────────────────────────── */
export async function getCommandeParId(id: string): Promise<ReponseCommande> {
  const res = await fetch(`${API_URL}/admin/commandes/${id}`, optionsBase);
  return verifierReponse<ReponseCommande>(res);
}

/* ── Changer statut ───────────────────────────────────────────────────── */
export async function modifierStatutCommande(
  id: string,
  statut: StatutCommande,
  raison?: string
): Promise<ReponseCommande> {
  const res = await fetch(`${API_URL}/admin/commandes/${id}/statut`, {
    ...optionsBase,
    method: 'PATCH',
    body: JSON.stringify({ statut, raison: raison ?? '' }),
  });
  return verifierReponse<ReponseCommande>(res);
}

/* ── Notes admin ──────────────────────────────────────────────────────── */
export async function modifierNotesCommande(
  id: string,
  notesAdmin: string
): Promise<ReponseCommande> {
  const res = await fetch(`${API_URL}/admin/commandes/${id}/notes`, {
    ...optionsBase,
    method: 'PATCH',
    body: JSON.stringify({ notesAdmin }),
  });
  return verifierReponse<ReponseCommande>(res);
}
