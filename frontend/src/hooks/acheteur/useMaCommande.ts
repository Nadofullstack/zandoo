import { useEffect, useState } from 'react';
import { annulerMaCommande, getMaCommande } from '../../services/acheteur/acheteurCommandeService';
import type { AutreCommandeGroupe, CommandeDetail } from '../../types/acheteur';

/** Détail d'une commande de l'acheteur + action d'annulation. */
export function useMaCommande(id: string | undefined) {
  const [commande, setCommande]               = useState<CommandeDetail | null>(null);
  const [autresCommandes, setAutresCommandes] = useState<AutreCommandeGroupe[]>([]);
  const [chargement, setChargement]           = useState(true);
  const [erreur, setErreur]                   = useState<string | null>(null);
  const [version, setVersion]                 = useState(0);

  useEffect(() => {
    if (!id) return;
    let annule = false;
    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const { data } = await getMaCommande(id);
        if (annule) return;
        setCommande(data.commande);
        setAutresCommandes(data.autresCommandes);
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message : 'Impossible de charger cette commande.');
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [id, version]);

  /** Annule la commande puis recharge son état (le suivi est recalculé côté API). */
  const annuler = async (raison: string) => {
    if (!id) return;
    await annulerMaCommande(id, raison);
    setVersion((v) => v + 1);
  };

  return { commande, autresCommandes, chargement, erreur, annuler, recharger: () => setVersion((v) => v + 1) };
}
