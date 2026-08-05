import { useState, useEffect, useCallback } from 'react';
import { getMesCommandes, marquerCommande } from '../../services/vendeur/vendeurService';
import type { CommandeVendeur, StatutCommande } from '../../types/vendeur';

interface Filtre { statut: string; page: number; }

export function useCommandesVendeur() {
  const [commandes, setCommandes]   = useState<CommandeVendeur[]>([]);
  const [pagination, setPagination] = useState<{ total: number; page: number; totalPages: number; limite: number } | null>(null);
  const [filtre, setFiltreState]    = useState<Filtre>({ statut: '', page: 1 });
  const [chargement, setChargement] = useState(true);
  const [chargementAction, setChargementAction] = useState<string | null>(null);
  const [erreur, setErreur]         = useState<string | null>(null);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);

  const charger = useCallback(async (f: Filtre) => {
    setChargement(true);
    setErreur(null);
    try {
      const rep = await getMesCommandes({ page: f.page, limite: 20, statut: f.statut || undefined });
      setCommandes(rep.data.commandes);
      setPagination(rep.data.pagination);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { charger(filtre); }, [filtre, charger]);

  const setFiltre = (partiel: Partial<Filtre>) =>
    setFiltreState((prev) => ({ ...prev, ...partiel }));

  const expedier = async (commandeId: string) => {
    setChargementAction(commandeId);
    setErreur(null);
    setMessageSucces(null);
    try {
      await marquerCommande(commandeId, 'expediee' as StatutCommande);
      setMessageSucces('Commande marquée comme expédiée.');
      charger(filtre);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setChargementAction(null);
    }
  };

  return { commandes, pagination, filtre, chargement, chargementAction, erreur, messageSucces, setFiltre, expedier };
}
