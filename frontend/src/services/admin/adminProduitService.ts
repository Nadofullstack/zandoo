import type {
  ReponseListeProduits,
  ReponseProduit,
  ReponseStatistiquesProduits,
  StatutProduit,
  FormulaireProduiit,
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

/* ── Statistiques ──────────────────────────────────────────────────────── */
export async function getStatistiquesProduits(): Promise<ReponseStatistiquesProduits> {
  const res = await fetch(`${API_URL}/admin/produits/statistiques`, optionsBase);
  return verifierReponse(res);
}

/* ── Liste ─────────────────────────────────────────────────────────────── */
export async function getProduits(params?: {
  statut?: StatutProduit;
  categorie?: string;
  vendeur?: string;
  recherche?: string;
  page?: number;
  limite?: number;
}): Promise<ReponseListeProduits> {
  const qs = new URLSearchParams();
  if (params?.statut)    qs.set('statut',    params.statut);
  if (params?.categorie) qs.set('categorie', params.categorie);
  if (params?.vendeur)   qs.set('vendeur',   params.vendeur);
  if (params?.recherche) qs.set('recherche', params.recherche);
  if (params?.page)      qs.set('page',      String(params.page));
  if (params?.limite)    qs.set('limite',    String(params.limite));

  const res = await fetch(`${API_URL}/admin/produits?${qs}`, optionsBase);
  return verifierReponse(res);
}

/* ── Détail ────────────────────────────────────────────────────────────── */
export async function getProduitParId(id: string): Promise<ReponseProduit> {
  const res = await fetch(`${API_URL}/admin/produits/${id}`, optionsBase);
  return verifierReponse(res);
}

/* ── Créer ─────────────────────────────────────────────────────────────── */
export async function creerProduit(donnees: Partial<FormulaireProduiit>): Promise<ReponseProduit> {
  const res = await fetch(`${API_URL}/admin/produits`, {
    ...optionsBase,
    method: 'POST',
    body: JSON.stringify(donnees),
  });
  return verifierReponse(res);
}

/* ── Modifier ──────────────────────────────────────────────────────────── */
export async function modifierProduit(
  id: string,
  donnees: Partial<FormulaireProduiit>
): Promise<ReponseProduit> {
  const res = await fetch(`${API_URL}/admin/produits/${id}`, {
    ...optionsBase,
    method: 'PUT',
    body: JSON.stringify(donnees),
  });
  return verifierReponse(res);
}

/* ── Statut ────────────────────────────────────────────────────────────── */
export async function modifierStatutProduit(
  id: string,
  statut: StatutProduit,
  raison?: string
): Promise<ReponseProduit> {
  const res = await fetch(`${API_URL}/admin/produits/${id}/statut`, {
    ...optionsBase,
    method: 'PATCH',
    body: JSON.stringify({ statut, raison: raison ?? '' }),
  });
  return verifierReponse(res);
}

/* ── Supprimer ─────────────────────────────────────────────────────────── */
export async function supprimerProduit(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/admin/produits/${id}`, {
    ...optionsBase,
    method: 'DELETE',
  });
  return verifierReponse(res);
}
