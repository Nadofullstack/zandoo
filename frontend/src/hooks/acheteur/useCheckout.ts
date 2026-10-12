import { useEffect, useMemo, useState } from 'react';
import { useAdresses } from './useAdresses';
import { getOptionsLivraison, passerCommande } from '../../services/acheteur/acheteurCheckoutService';
import type { MethodePaiementCheckout } from '../../services/acheteur/acheteurCheckoutService';
import { ADRESSE_VIDE, validerAdresse } from '../../components/acheteur/adresses/adresseUtils';
import type { ChampsAdresse, ModeLivraison, OptionsBoutique } from '../../types/acheteur';

export type EtapeCheckout = 'adresse' | 'livraison' | 'paiement' | 'confirmation';
export const ETAPES_CHECKOUT: EtapeCheckout[] = ['adresse', 'livraison', 'paiement', 'confirmation'];

/** Adresse choisie : une adresse du carnet, ou une nouvelle saisie (éventuellement à enregistrer) */
export type ChoixAdresse =
  | { type: 'enregistree'; id: string }
  | { type: 'nouvelle'; champs: ChampsAdresse; enregistrer: boolean };

export interface PaiementCheckout {
  methode: MethodePaiementCheckout | '';
  numeroMobile: string;
}

/** Premier mode disponible d'une boutique (domicile prioritaire) */
const modeParDefaut = (b: OptionsBoutique): ModeLivraison | null =>
  b.options.domicile.disponible ? 'domicile' : b.options.retrait.disponible ? 'retrait' : null;

/**
 * Pilote le tunnel de commande : Adresse → Livraison → Paiement → Confirmation.
 * Les frais affichés viennent de l'API ; ils sont recalculés côté serveur à la validation.
 */
export function useCheckout({ ouvert, nomParDefaut = '', telephoneParDefaut = '' }: { ouvert: boolean; nomParDefaut?: string; telephoneParDefaut?: string }) {
  const carnet = useAdresses(ouvert);

  const [etape, setEtape]           = useState<EtapeCheckout>('adresse');
  /* Choix explicite de l'utilisateur ; null = sélection par défaut (calculée ci-dessous) */
  const [choixUtilisateur, setChoix] = useState<ChoixAdresse | null>(null);
  const [boutiques, setBoutiques]   = useState<OptionsBoutique[]>([]);
  const [livraisons, setLivraisons] = useState<Record<string, ModeLivraison>>({});
  const [paiement, setPaiement]     = useState<PaiementCheckout>({ methode: '', numeroMobile: '' });
  const [chargementOptions, setChargementOptions] = useState(false);
  const [envoi, setEnvoi]           = useState(false);
  const [erreur, setErreur]         = useState<string | null>(null);

  /* Sélection effective : choix de l'utilisateur, sinon adresse par défaut, sinon formulaire pré-rempli */
  const choixAdresse: ChoixAdresse | null = useMemo(() => {
    if (choixUtilisateur) return choixUtilisateur;
    if (carnet.chargement) return null;
    const parDefaut = carnet.adresses.find((a) => a.parDefaut) ?? carnet.adresses[0];
    return parDefaut
      ? { type: 'enregistree', id: parDefaut._id }
      : { type: 'nouvelle', champs: { ...ADRESSE_VIDE, nomComplet: nomParDefaut, telephone: telephoneParDefaut }, enregistrer: true };
  }, [choixUtilisateur, carnet.chargement, carnet.adresses, nomParDefaut, telephoneParDefaut]);

  /* Réinitialisation à la fermeture (après l'animation) */
  useEffect(() => {
    if (ouvert) return;
    const minuteur = setTimeout(() => {
      setEtape('adresse');
      setChoix(null);
      setBoutiques([]);
      setLivraisons({});
      setErreur(null);
    }, 300);
    return () => clearTimeout(minuteur);
  }, [ouvert]);

  const adresseActive: ChampsAdresse | null = useMemo(() => {
    if (!choixAdresse) return null;
    if (choixAdresse.type === 'nouvelle') return choixAdresse.champs;
    return carnet.adresses.find((a) => a._id === choixAdresse.id) ?? null;
  }, [choixAdresse, carnet.adresses]);

  /* ── Totaux ─────────────────────────────────────────────────────────────── */
  const totaux = useMemo(() => {
    const sousTotal = boutiques.reduce((s, b) => s + b.sousTotal, 0);
    const frais = boutiques.reduce((s, b) => {
      const mode = livraisons[b.vendeur._id];
      return s + (mode ? b.options[mode].frais ?? 0 : 0);
    }, 0);
    return { sousTotal, frais, total: sousTotal + frais };
  }, [boutiques, livraisons]);

  /* ── Navigation entre étapes ────────────────────────────────────────────── */
  const allerA = (e: EtapeCheckout) => { setErreur(null); setEtape(e); };

  const validerEtapeAdresse = async () => {
    if (!adresseActive) return setErreur('Choisissez une adresse de livraison.');
    if (choixAdresse?.type === 'nouvelle') {
      const invalide = validerAdresse(choixAdresse.champs);
      if (invalide) return setErreur(invalide);
    }

    setChargementOptions(true);
    setErreur(null);
    try {
      const { data } = await getOptionsLivraison(adresseActive.ville);
      setBoutiques(data.boutiques);
      /* Conserve les choix précédents encore valides, sinon le premier mode disponible */
      setLivraisons((prec) => Object.fromEntries(
        data.boutiques
          .map((b) => {
            const precedent = prec[b.vendeur._id];
            const mode = precedent && b.options[precedent].disponible ? precedent : modeParDefaut(b);
            return [b.vendeur._id, mode] as const;
          })
          .filter((paire): paire is readonly [string, ModeLivraison] => paire[1] !== null),
      ));
      setEtape('livraison');
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Impossible de calculer la livraison.');
    } finally {
      setChargementOptions(false);
    }
  };

  const validerEtapeLivraison = () => {
    const bloquee = boutiques.find((b) => !livraisons[b.vendeur._id]);
    if (bloquee) {
      return setErreur(`${bloquee.vendeur.nomEntreprise} ne livre pas à ${adresseActive?.ville}. Retirez ses articles du panier ou changez d'adresse.`);
    }
    allerA('paiement');
  };

  const validerEtapePaiement = () => {
    if (!paiement.methode) return setErreur('Choisissez un moyen de paiement.');
    if (paiement.methode === 'mobile_money' && !/^\+?[0-9\s.-]{8,20}$/.test(paiement.numeroMobile.trim())) {
      return setErreur('Indiquez un numéro Mobile Money valide.');
    }
    allerA('confirmation');
  };

  const suivant = () => {
    if (etape === 'adresse') return validerEtapeAdresse();
    if (etape === 'livraison') return validerEtapeLivraison();
    if (etape === 'paiement') return validerEtapePaiement();
  };

  const precedent = () => {
    const i = ETAPES_CHECKOUT.indexOf(etape);
    if (i > 0) allerA(ETAPES_CHECKOUT[i - 1]);
  };

  /* ── Validation finale ──────────────────────────────────────────────────── */
  const confirmer = async () => {
    if (!choixAdresse || !paiement.methode) return;
    setEnvoi(true);
    setErreur(null);
    try {
      let adresse: { adresseId: string } | { adresseLivraison: ChampsAdresse };
      if (choixAdresse.type === 'enregistree') {
        adresse = { adresseId: choixAdresse.id };
      } else if (choixAdresse.enregistrer) {
        const creee = await carnet.ajouter(choixAdresse.champs, carnet.adresses.length === 0);
        adresse = creee ? { adresseId: creee._id } : { adresseLivraison: choixAdresse.champs };
        if (creee) setChoix({ type: 'enregistree', id: creee._id }); // évite un doublon si nouvel essai
      } else {
        adresse = { adresseLivraison: choixAdresse.champs };
      }

      await passerCommande({
        ...adresse,
        livraisons,
        paiement: { methode: paiement.methode, ...(paiement.methode === 'mobile_money' ? { numeroMobile: paiement.numeroMobile.trim() } : {}) },
      });
      return true;
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'La commande a échoué. Veuillez réessayer.');
      setEnvoi(false);
      return false;
    }
  };

  return {
    etape, erreur, envoi, chargementOptions,
    carnet, choixAdresse, setChoix, adresseActive,
    boutiques, livraisons, setLivraisons, totaux,
    paiement, setPaiement,
    suivant, precedent, allerA, confirmer,
  };
}
