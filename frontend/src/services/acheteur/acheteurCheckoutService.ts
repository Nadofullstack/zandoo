import api from '../api';
import type { ChampsAdresse, ModeLivraison, ReponseOptionsLivraison } from '../../types/acheteur';

export type MethodePaiementCheckout = 'mobile_money' | 'especes';

export interface CommandeCheckout {
  /** Adresse enregistrée (prioritaire) ou adresse saisie */
  adresseId?: string;
  adresseLivraison?: ChampsAdresse;
  /** Mode de livraison choisi par boutique (vendeurId → mode) */
  livraisons: Record<string, ModeLivraison>;
  paiement: { methode: MethodePaiementCheckout; numeroMobile?: string };
  notesClient?: string;
}

export interface ReponseCheckout {
  success: boolean;
  message: string;
  data: {
    groupeCommandeId: string;
    commandes: { _id: string; numero: string; fraisLivraison: number; total: number; statut: string }[];
  };
}

/** Options et frais de livraison de chaque boutique du panier pour une ville. */
export async function getOptionsLivraison(ville: string): Promise<ReponseOptionsLivraison> {
  const { data } = await api.post('/acheteur/checkout/options-livraison', { ville });
  return data;
}

/** Passage en caisse : crée une commande par boutique. Les frais sont recalculés côté serveur. */
export async function passerCommande(commande: CommandeCheckout): Promise<ReponseCheckout> {
  const { data } = await api.post('/acheteur/checkout', commande);
  return data;
}
