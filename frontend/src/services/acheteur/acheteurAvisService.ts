import api from '../api';
import type {
  ReponseAvisProduit,
  ReponseMesAvisCommande,
  ReponseMonAvisProduit,
  SaisieAvis,
  TriAvis,
} from '../../types/acheteur';

/** Avis publiés d'un produit + résumé des notes (public). */
export async function getAvisProduit(
  produitId: string,
  params: { page?: number; limite?: number; note?: number; tri?: TriAvis } = {},
): Promise<ReponseAvisProduit> {
  const { data } = await api.get(`/acheteur/produits/${produitId}/avis`, { params });
  return data;
}

/** L'utilisateur peut-il évaluer ce produit ? + son avis existant. */
export async function getMonAvisProduit(produitId: string): Promise<ReponseMonAvisProduit> {
  const { data } = await api.get(`/acheteur/avis/produit/${produitId}`);
  return data;
}

/** Avis déjà laissés sur les produits d'une commande (produitId → avis). */
export async function getMesAvisCommande(commandeId: string): Promise<ReponseMesAvisCommande> {
  const { data } = await api.get(`/acheteur/avis/commande/${commandeId}`);
  return data;
}

export async function creerAvis(produitId: string, saisie: SaisieAvis) {
  const { data } = await api.post('/acheteur/avis', { produitId, ...saisie });
  return data;
}

export async function modifierAvis(avisId: string, saisie: SaisieAvis) {
  const { data } = await api.put(`/acheteur/avis/${avisId}`, saisie);
  return data;
}

export async function supprimerAvis(avisId: string) {
  const { data } = await api.delete(`/acheteur/avis/${avisId}`);
  return data;
}
