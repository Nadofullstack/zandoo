import type { PolitiqueLivraison } from '../../../types/vendeur';

/**
 * État du formulaire « Livraison » côté vendeur et conversions API ⇄ formulaire.
 * Les montants et délais sont saisis comme du texte puis convertis à l'envoi.
 */

export interface ZoneForm {
  cle: string; // identifiant local stable pour les listes React
  nom: string;
  villes: string[];
  tarif: string;
  delaiMin: string;
  delaiMax: string;
}

export interface FormLivraison {
  domicileActif: boolean;
  zones: ZoneForm[];
  autresVillesActif: boolean;
  tarifAutresVilles: string;
  delaiAutresMin: string;
  delaiAutresMax: string;
  gratuiteActif: boolean;
  gratuiteDes: string;
  retraitActif: boolean;
  retraitAdresse: string;
  retraitVille: string;
  retraitHoraires: string;
  retraitInstructions: string;
}

let compteur = 0;
const nouvelleCle = () => `zone-${Date.now()}-${compteur++}`;

export const nouvelleZone = (): ZoneForm => ({ cle: nouvelleCle(), nom: '', villes: [], tarif: '', delaiMin: '1', delaiMax: '2' });

/** Politique API → formulaire. `villeBoutique` pré-remplit le point de retrait. */
export function versFormulaire(p: PolitiqueLivraison, villeBoutique = ''): FormLivraison {
  const d = p.domicile;
  return {
    domicileActif:     d.actif,
    zones:             d.zones.map((z) => ({
      cle: z._id ?? nouvelleCle(), nom: z.nom, villes: z.villes,
      tarif: String(z.tarif), delaiMin: String(z.delaiMin), delaiMax: String(z.delaiMax),
    })),
    autresVillesActif: d.tarifAutresVilles !== null,
    tarifAutresVilles: d.tarifAutresVilles !== null ? String(d.tarifAutresVilles) : '',
    delaiAutresMin:    String(d.delaiAutresVillesMin),
    delaiAutresMax:    String(d.delaiAutresVillesMax),
    gratuiteActif:     d.gratuiteDes !== null,
    gratuiteDes:       d.gratuiteDes !== null ? String(d.gratuiteDes) : '',
    retraitActif:        p.retrait.actif,
    retraitAdresse:      p.retrait.adresse,
    retraitVille:        p.retrait.ville || villeBoutique,
    retraitHoraires:     p.retrait.horaires,
    retraitInstructions: p.retrait.instructions,
  };
}

const nombre = (v: string) => Number(v.replace(/\s/g, ''));

/** Formulaire → payload API (le serveur revalide tout). */
export function versPolitique(f: FormLivraison): Omit<PolitiqueLivraison, 'configuree'> {
  return {
    domicile: {
      actif: f.domicileActif,
      zones: f.zones.map((z) => ({
        nom: z.nom.trim(), villes: z.villes, tarif: nombre(z.tarif), delaiMin: nombre(z.delaiMin), delaiMax: nombre(z.delaiMax),
      })),
      tarifAutresVilles:    f.autresVillesActif ? nombre(f.tarifAutresVilles) : null,
      delaiAutresVillesMin: nombre(f.delaiAutresMin),
      delaiAutresVillesMax: nombre(f.delaiAutresMax),
      gratuiteDes:          f.gratuiteActif ? nombre(f.gratuiteDes) : null,
    },
    retrait: {
      actif:        f.retraitActif,
      adresse:      f.retraitAdresse.trim(),
      ville:        f.retraitVille.trim(),
      horaires:     f.retraitHoraires.trim(),
      instructions: f.retraitInstructions.trim(),
    },
  };
}

/** Contrôles rapides avant envoi (messages immédiats ; le serveur fait foi). */
export function validerFormulaire(f: FormLivraison): string | null {
  if (!f.domicileActif && !f.retraitActif) return 'Proposez au moins un mode : livraison à domicile ou retrait en boutique.';

  if (f.domicileActif) {
    for (const [i, z] of f.zones.entries()) {
      const nom = z.nom.trim() || `Zone ${i + 1}`;
      if (!z.nom.trim()) return `Zone ${i + 1} : donnez-lui un nom.`;
      if (z.villes.length === 0) return `${nom} : ajoutez au moins une ville.`;
      if (z.tarif === '' || Number.isNaN(nombre(z.tarif))) return `${nom} : indiquez un tarif.`;
      if (nombre(z.delaiMin) > nombre(z.delaiMax)) return `${nom} : le délai minimum dépasse le maximum.`;
    }
    if (f.autresVillesActif && (f.tarifAutresVilles === '' || Number.isNaN(nombre(f.tarifAutresVilles)))) {
      return 'Indiquez le tarif pour les autres villes.';
    }
    if (f.zones.length === 0 && !f.autresVillesActif) {
      return 'Ajoutez au moins une zone de livraison ou un tarif pour les autres villes.';
    }
    if (f.gratuiteActif && (f.gratuiteDes === '' || Number.isNaN(nombre(f.gratuiteDes)))) {
      return 'Indiquez le montant à partir duquel la livraison est offerte.';
    }
  }

  if (f.retraitActif && (!f.retraitAdresse.trim() || !f.retraitVille.trim())) {
    return "Retrait en boutique : indiquez l'adresse et la ville du point de retrait.";
  }
  return null;
}
