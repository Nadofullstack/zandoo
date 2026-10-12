import type { ChampsAdresse } from '../../../types/acheteur';

/** Constantes et validation partagées des adresses de livraison. */

export const ADRESSE_VIDE: ChampsAdresse = {
  libelle: '', nomComplet: '', telephone: '', ville: '', quartier: '', rue: '', pays: 'Bénin', instructions: '',
};

export const LIBELLES_SUGGERES = ['Maison', 'Bureau', 'Famille'];

/** Validation côté client (le serveur revalide). Renvoie un message ou null. */
export function validerAdresse(a: ChampsAdresse): string | null {
  if (a.nomComplet.trim().length < 2) return 'Le nom du destinataire est requis.';
  if (!/^\+?[0-9\s.-]{8,20}$/.test(a.telephone.trim())) return 'Numéro de téléphone invalide.';
  if (!a.ville.trim()) return 'La ville est requise.';
  return null;
}

/** Libellé court d'une adresse sur une ligne (ex: « Cadjèhoun, Cotonou ») */
export const resumerAdresse = (a: Pick<ChampsAdresse, 'quartier' | 'rue' | 'ville'>) =>
  [a.rue, a.quartier, a.ville].filter(Boolean).join(', ');
