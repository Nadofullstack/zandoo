import { useEffect, useState } from 'react';
import * as service from '../../services/acheteur/acheteurAvisService';
import type { MonAvis, SaisieAvis } from '../../types/acheteur';

/**
 * Avis de l'acheteur sur les produits d'une commande livrée
 * (boutons « Noter » / « Modifier mon avis » du détail de commande).
 */
export function useAvisCommande(commandeId: string | undefined, actif: boolean) {
  const [avisParProduit, setAvisParProduit] = useState<Record<string, MonAvis>>({});
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!commandeId || !actif) return;
    let annule = false;
    service.getMesAvisCommande(commandeId)
      .then(({ data }) => { if (!annule) setAvisParProduit(data.avis); })
      .catch(() => { /* non bloquant */ });
    return () => { annule = true; };
  }, [commandeId, actif, version]);

  const enregistrer = async (produitId: string, saisie: SaisieAvis) => {
    const existant = avisParProduit[produitId];
    if (existant) await service.modifierAvis(existant._id, saisie);
    else await service.creerAvis(produitId, saisie);
    setVersion((v) => v + 1);
  };

  const supprimer = async (produitId: string) => {
    const existant = avisParProduit[produitId];
    if (!existant) return;
    await service.supprimerAvis(existant._id);
    setVersion((v) => v + 1);
  };

  return { avisParProduit, enregistrer, supprimer };
}
