import api from '../api';
import type { ReponsePanier } from '../../types/acheteur';

/** Récupère le panier de l'acheteur connecté. */
export async function getPanier(): Promise<ReponsePanier> {
  const { data } = await api.get('/acheteur/panier');
  return data;
}

/** Ajoute un produit au panier ou incrémente la quantité. */
export async function ajouterAuPanier(
  produitId: string,
  quantite = 1,
  variante = ''
): Promise<ReponsePanier> {
  const { data } = await api.post('/acheteur/panier', { produitId, quantite, variante });
  return data;
}

/** Met à jour la quantité d'une ligne du panier. */
export async function modifierQuantite(
  ligneId: string,
  quantite: number
): Promise<ReponsePanier> {
  const { data } = await api.put(`/acheteur/panier/${ligneId}`, { quantite });
  return data;
}

/** Retire une ligne du panier. */
export async function retirerDuPanier(ligneId: string): Promise<ReponsePanier> {
  const { data } = await api.delete(`/acheteur/panier/${ligneId}`);
  return data;
}

/** Vide entièrement le panier. */
export async function viderPanier(): Promise<ReponsePanier> {
  const { data } = await api.delete('/acheteur/panier');
  return data;
}
