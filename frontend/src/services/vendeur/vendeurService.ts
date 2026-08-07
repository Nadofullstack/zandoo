import api from '../api';
import type {
  PayloadInscription,
  ReponseInscription,
  ReponseStatutInscription,
  ReponseBoutique,
  ReponseDashboard,
  ReponseStatVentes,
  ReponseProduits,
  ReponseProduit,
  ReponseStatistiquesProduits,
  ReponseCommandes,
  ReponseCommande,
  ReponseStatistiquesCommandesVendeur,
  ReponsePromotions,
  StatutCommande,
} from '../../types/vendeur';

/* ── Inscription ──────────────────────────────────────────────────────── */

export async function soumettreInscription(payload: PayloadInscription): Promise<ReponseInscription> {
  const { data } = await api.post('/vendeur/inscription', payload);
  return data;
}

export async function getStatutInscription(): Promise<ReponseStatutInscription> {
  const { data } = await api.get('/vendeur/statut-inscription');
  return data;
}

/* ── Tableau de bord ──────────────────────────────────────────────────── */

export async function getDashboard(): Promise<ReponseDashboard> {
  const { data } = await api.get('/vendeur/tableau-de-bord');
  return data;
}

export async function getStatistiquesVentes(): Promise<ReponseStatVentes> {
  const { data } = await api.get('/vendeur/tableau-de-bord/statistiques-ventes');
  return data;
}

/* ── Boutique ─────────────────────────────────────────────────────────── */

export async function getBoutique(): Promise<ReponseBoutique> {
  const { data } = await api.get('/vendeur/boutique');
  return data;
}

export async function mettreAJourBoutique(payload: Partial<{
  logo: string;
  banniere: string;
  descriptionBoutique: string;
  nomEntreprise: string;
  secteurActivite: string;
  adresse: { rue?: string; ville?: string; pays?: string };
  emailContact: string;
  telephoneContact: string;
}>): Promise<ReponseBoutique> {
  const { data } = await api.patch('/vendeur/boutique', payload);
  return data;
}

/* ── Produits ─────────────────────────────────────────────────────────── */

export async function getMesProduits(params?: {
  page?: number;
  limite?: number;
  statut?: string;
  recherche?: string;
}): Promise<ReponseProduits> {
  const { data } = await api.get('/vendeur/produits', { params });
  return data;
}

export async function getStatistiquesProduits(): Promise<ReponseStatistiquesProduits> {
  const { data } = await api.get('/vendeur/produits/statistiques');
  return data;
}

export async function creerProduitVendeur(payload: object): Promise<ReponseProduit> {
  const { data } = await api.post('/vendeur/produits', payload);
  return data;
}

export async function getProduitVendeurParId(id: string): Promise<ReponseProduit> {
  const { data } = await api.get(`/vendeur/produits/${id}`);
  return data;
}

export async function modifierProduitVendeur(id: string, payload: object): Promise<ReponseProduit> {
  const { data } = await api.put(`/vendeur/produits/${id}`, payload);
  return data;
}

export async function supprimerProduitVendeur(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/vendeur/produits/${id}`);
  return data;
}

export async function mettreAJourStock(id: string, quantiteDisponible: number): Promise<ReponseProduit> {
  const { data } = await api.patch(`/vendeur/produits/${id}/stock`, { quantiteDisponible });
  return data;
}

export async function modifierStatutProduit(id: string, statut: 'en_stock' | 'faible' | 'en_rupture'): Promise<ReponseProduit> {
  const { data } = await api.patch(`/vendeur/produits/${id}/statut`, { statut });
  return data;
}

/* ── Commandes ────────────────────────────────────────────────────────── */

export async function getMesCommandes(params?: {
  page?: number;
  limite?: number;
  statut?: string;
}): Promise<ReponseCommandes> {
  const { data } = await api.get('/vendeur/commandes', { params });
  return data;
}

export async function getStatistiquesCommandesVendeur(): Promise<ReponseStatistiquesCommandesVendeur> {
  const { data } = await api.get('/vendeur/commandes/statistiques');
  return data;
}

export async function getCommandeParId(id: string): Promise<ReponseCommande> {
  const { data } = await api.get(`/vendeur/commandes/${id}`);
  return data;
}

export async function marquerCommande(id: string, statut: StatutCommande): Promise<ReponseCommande> {
  const { data } = await api.patch(`/vendeur/commandes/${id}/statut`, { statut });
  return data;
}

export async function annulerCommande(id: string, raison?: string): Promise<ReponseCommande> {
  const { data } = await api.patch(`/vendeur/commandes/${id}/annuler`, { raison: raison ?? '' });
  return data;
}

/* ── Promotions ───────────────────────────────────────────────────────── */

export async function getMesPromotions(): Promise<ReponsePromotions> {
  const { data } = await api.get('/vendeur/promotions');
  return data;
}

export async function gererPromotion(
  produitId: string,
  prixPromotionnel: number | null
): Promise<ReponseProduit> {
  const { data } = await api.patch(`/vendeur/promotions/${produitId}`, { prixPromotionnel });
  return data;
}
