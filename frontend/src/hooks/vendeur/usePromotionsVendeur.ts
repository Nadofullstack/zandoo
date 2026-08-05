import { useState, useEffect } from 'react';
import { getMesPromotions, gererPromotion } from '../../services/vendeur/vendeurService';
import type { ProduitPromotion } from '../../types/vendeur';

export function usePromotionsVendeur() {
  const [produits, setProduits]       = useState<ProduitPromotion[]>([]);
  const [chargement, setChargement]   = useState(true);
  const [chargementAction, setChargementAction] = useState<string | null>(null);
  const [erreur, setErreur]           = useState<string | null>(null);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);

  const charger = () => {
    setChargement(true);
    getMesPromotions()
      .then((r) => setProduits(r.data.produits))
      .catch((err) => setErreur(err instanceof Error ? err.message : 'Erreur de chargement.'))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const appliquerPromotion = async (produitId: string, prixPromotionnel: number | null) => {
    setChargementAction(produitId);
    setErreur(null);
    setMessageSucces(null);
    try {
      await gererPromotion(produitId, prixPromotionnel);
      setMessageSucces(prixPromotionnel ? 'Promotion appliquée.' : 'Promotion supprimée.');
      charger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setChargementAction(null);
    }
  };

  return { produits, chargement, chargementAction, erreur, messageSucces, appliquerPromotion };
}
