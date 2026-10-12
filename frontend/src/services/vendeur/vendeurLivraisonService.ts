import api from '../api';
import type { PolitiqueLivraison, ReponsePolitiqueLivraison } from '../../types/vendeur';

/** Politique de livraison de la boutique du vendeur connecté. */
export async function getPolitiqueLivraison(): Promise<ReponsePolitiqueLivraison> {
  const { data } = await api.get('/vendeur/livraison');
  return data;
}

/** Enregistre la politique complète (validée et normalisée côté serveur). */
export async function enregistrerPolitiqueLivraison(
  politique: Omit<PolitiqueLivraison, 'configuree'>,
): Promise<ReponsePolitiqueLivraison> {
  const { data } = await api.put('/vendeur/livraison', politique);
  return data;
}
