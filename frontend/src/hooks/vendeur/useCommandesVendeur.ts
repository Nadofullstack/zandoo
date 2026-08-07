import { useState, useEffect, useCallback } from 'react';
import {
  getMesCommandes,
  marquerCommande,
  annulerCommande,
  getStatistiquesCommandesVendeur,
} from '../../services/vendeur/vendeurService';
import type {
  CommandeVendeur,
  StatutCommande,
  StatistiquesCommandesVendeur,
} from '../../types/vendeur';

interface Filtre { statut: string; page: number; }

export function useCommandesVendeur() {
  const [commandes, setCommandes]   = useState<CommandeVendeur[]>([]);
  const [pagination, setPagination] = useState<{ total: number; page: number; totalPages: number; limite: number } | null>(null);
  const [statistiques, setStatistiques] = useState<StatistiquesCommandesVendeur | null>(null);
  const [filtre, setFiltreState]    = useState<Filtre>({ statut: '', page: 1 });
  const [chargement, setChargement] = useState(true);
  const [chargementAction, setChargementAction] = useState<string | null>(null);
  const [erreur, setErreur]         = useState<string | null>(null);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);

  const charger = useCallback(async (f: Filtre) => {
    setChargement(true);
    setErreur(null);
    try {
      const [repCommandes, repStats] = await Promise.all([
        getMesCommandes({ page: f.page, limite: 20, statut: f.statut || undefined }),
        getStatistiquesCommandesVendeur(),
      ]);
      setCommandes(repCommandes.data.commandes);
      setPagination(repCommandes.data.pagination);
      setStatistiques(repStats.data.statistiques);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { charger(filtre); }, [filtre, charger]);

  const setFiltre = (partiel: Partial<Filtre>) =>
    setFiltreState((prev) => ({ ...prev, ...partiel }));

  const afficherSucces = (msg: string) => {
    setMessageSucces(msg);
    setTimeout(() => setMessageSucces(null), 3500);
  };

  const changerStatut = async (commandeId: string, statut: StatutCommande) => {
    setChargementAction(commandeId);
    setErreur(null);
    try {
      await marquerCommande(commandeId, statut);
      const libelles: Record<string, string> = {
        en_preparation: 'en préparation',
        expediee: 'expédiée',
      };
      afficherSucces(`Commande marquée comme ${libelles[statut] ?? statut}.`);
      charger(filtre);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setChargementAction(null);
    }
  };

  const annuler = async (commandeId: string, raison?: string) => {
    setChargementAction(commandeId);
    setErreur(null);
    try {
      await annulerCommande(commandeId, raison);
      afficherSucces('Commande annulée avec succès.');
      charger(filtre);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur lors de l'annulation.");
    } finally {
      setChargementAction(null);
    }
  };

  // Raccourcis
  const expedier       = (id: string) => changerStatut(id, 'expediee' as StatutCommande);
  const mettreEnPrep   = (id: string) => changerStatut(id, 'en_preparation' as StatutCommande);

  return {
    commandes, pagination, statistiques, filtre, chargement, chargementAction,
    erreur, messageSucces, setFiltre, changerStatut, expedier, mettreEnPrep, annuler,
  };
}
