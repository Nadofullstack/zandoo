import { useState, useEffect } from 'react';
import { getBoutique, mettreAJourBoutique } from '../../services/vendeur/vendeurService';
import type { Boutique } from '../../types/vendeur';

export function useBoutiqueVendeur() {
  const [boutique, setBoutique]       = useState<Boutique | null>(null);
  const [chargement, setChargement]   = useState(true);
  const [chargementSave, setChargementSave] = useState(false);
  const [erreur, setErreur]           = useState<string | null>(null);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);

  const charger = () => {
    setChargement(true);
    getBoutique()
      .then((r) => setBoutique(r.data.vendeur))
      .catch((err) => setErreur(err instanceof Error ? err.message : 'Erreur de chargement.'))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const sauvegarder = async (payload: Parameters<typeof mettreAJourBoutique>[0]) => {
    setChargementSave(true);
    setErreur(null);
    setMessageSucces(null);
    try {
      const rep = await mettreAJourBoutique(payload);
      setBoutique(rep.data.vendeur);
      setMessageSucces('Boutique mise à jour avec succès.');
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setChargementSave(false);
    }
  };

  return { boutique, chargement, chargementSave, erreur, messageSucces, sauvegarder };
}
