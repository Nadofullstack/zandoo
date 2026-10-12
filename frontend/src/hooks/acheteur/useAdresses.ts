import { useCallback, useEffect, useState } from 'react';
import * as service from '../../services/acheteur/acheteurAdresseService';
import type { AdresseEnregistree, ChampsAdresse } from '../../types/acheteur';

/**
 * Carnet d'adresses de l'utilisateur.
 * Chaque mutation renvoie la liste à jour depuis l'API (source de vérité
 * pour l'adresse par défaut et l'ordre d'affichage).
 */
export function useAdresses(actif = true) {
  const [adresses, setAdresses]     = useState<AdresseEnregistree[]>([]);
  const [chargement, setChargement] = useState(actif);
  const [erreur, setErreur]         = useState<string | null>(null);
  const [version, setVersion]       = useState(0);

  useEffect(() => {
    if (!actif) return;
    let annule = false;
    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const { data } = await service.getMesAdresses();
        if (!annule) setAdresses(data.adresses);
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message : 'Impossible de charger vos adresses.');
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [actif, version]);

  const recharger = useCallback(() => setVersion((v) => v + 1), []);

  /** Ajoute une adresse et renvoie l'adresse créée (pour la sélectionner aussitôt) */
  const ajouter = async (champs: ChampsAdresse, parDefaut = false) => {
    const { data } = await service.ajouterAdresse({ ...champs, parDefaut });
    setAdresses(data.adresses);
    return data.adresse;
  };

  const modifier = async (id: string, champs: ChampsAdresse, parDefaut?: boolean) => {
    const { data } = await service.modifierAdresse(id, { ...champs, ...(parDefaut ? { parDefaut } : {}) });
    setAdresses(data.adresses);
  };

  const definirParDefaut = async (id: string) => {
    const { data } = await service.definirAdresseParDefaut(id);
    setAdresses(data.adresses);
  };

  const supprimer = async (id: string) => {
    const { data } = await service.supprimerAdresse(id);
    setAdresses(data.adresses);
  };

  return { adresses, chargement, erreur, recharger, ajouter, modifier, definirParDefaut, supprimer };
}
