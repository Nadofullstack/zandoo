import api from '../api';
import type { AvisBoutique, ReponseAvisBoutique } from '../../types/vendeur';

/** Avis reçus sur les produits de la boutique. */
export async function getAvisBoutique(params: { page?: number; note?: number; filtre?: 'sans_reponse' } = {}): Promise<ReponseAvisBoutique> {
  const { data } = await api.get('/vendeur/avis', { params });
  return data;
}

/** Publie (ou retire, si texte vide) la réponse de la boutique à un avis. */
export async function repondreAvis(avisId: string, texte: string): Promise<AvisBoutique['reponseVendeur']> {
  const { data } = await api.patch(`/vendeur/avis/${avisId}/reponse`, { texte });
  return data.data.reponseVendeur;
}
