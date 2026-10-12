/**
 * Calcul des options et frais de livraison.
 *
 * Règles (tarifs fixés par chaque vendeur, frais facturés par boutique) :
 *  - Domicile : tarif de la zone contenant la ville de l'acheteur, sinon
 *    `tarifAutresVilles` ; indisponible si aucun tarif ne s'applique.
 *    Gratuit si le sous-total de la boutique atteint `gratuiteDes`.
 *  - Retrait en boutique : gratuit, si activé par le vendeur.
 *  - Boutique non configurée : livraison à domicile offerte (comportement historique).
 *
 * Fonctions pures : aucune I/O, testables isolément.
 */

export const MODES_LIVRAISON = ['domicile', 'retrait'];

/** Normalise un nom de ville pour comparaison (casse, accents, espaces, tirets). */
export const normaliserVille = (ville = '') =>
  String(ville)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[-'’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Trouve la zone tarifaire du vendeur qui couvre la ville, ou null. */
export const trouverZone = (zones = [], ville) => {
  const cible = normaliserVille(ville);
  if (!cible) return null;
  return zones.find((z) => z.villes.some((v) => normaliserVille(v) === cible)) ?? null;
};

/**
 * Options de livraison d'une boutique pour une ville et un sous-total donnés.
 *
 * @param {object} livraison - Vendeur.livraison
 * @param {{ ville: string, sousTotal: number }} contexte
 * @returns {{ domicile: object, retrait: object }}
 *   Chaque option : { disponible, frais, zone, delaiMin, delaiMax, raison?, gratuite? , pointRetrait? }
 */
export function calculerOptionsLivraison(livraison, { ville, sousTotal }) {
  const config = livraison ?? {};

  /* ── Domicile ─────────────────────────────────────────────────────────── */
  let domicile;
  if (!config.configuree) {
    domicile = { disponible: true, frais: 0, zone: '', delaiMin: null, delaiMax: null, gratuite: true };
  } else if (!config.domicile?.actif) {
    domicile = { disponible: false, raison: "Cette boutique ne livre pas à domicile." };
  } else {
    const d = config.domicile;
    const zone = trouverZone(d.zones, ville);
    let base = null;

    if (zone) {
      base = { frais: zone.tarif, zone: zone.nom, delaiMin: zone.delaiMin, delaiMax: zone.delaiMax };
    } else if (d.tarifAutresVilles !== null && d.tarifAutresVilles !== undefined) {
      base = { frais: d.tarifAutresVilles, zone: 'Autres villes', delaiMin: d.delaiAutresVillesMin, delaiMax: d.delaiAutresVillesMax };
    }

    if (!base) {
      domicile = { disponible: false, raison: `Cette boutique ne livre pas à ${ville || 'cette adresse'}.` };
    } else {
      const gratuite = d.gratuiteDes !== null && d.gratuiteDes !== undefined && sousTotal >= d.gratuiteDes;
      domicile = { disponible: true, ...base, frais: gratuite ? 0 : base.frais, gratuite: gratuite || base.frais === 0 };
    }
  }

  /* ── Retrait en boutique ──────────────────────────────────────────────── */
  const r = config.retrait;
  const retrait = config.configuree && r?.actif
    ? {
        disponible: true,
        frais: 0,
        gratuite: true,
        zone: '',
        delaiMin: null,
        delaiMax: null,
        pointRetrait: { adresse: r.adresse, ville: r.ville, horaires: r.horaires, instructions: r.instructions },
      }
    : { disponible: false, raison: "Le retrait en boutique n'est pas proposé." };

  /* Montant à partir duquel la livraison devient gratuite (pour l'incitation côté UI) */
  const seuil = config.configuree && config.domicile?.actif ? config.domicile.gratuiteDes ?? null : null;
  if (domicile.disponible && seuil !== null && !domicile.gratuite) {
    domicile.resteAvantGratuite = Math.max(0, seuil - sousTotal);
  }

  return { domicile, retrait };
}

export class ErreurLivraison extends Error {
  constructor(message) {
    super(message);
    this.status = 422;
  }
}

/**
 * Résout le mode choisi par l'acheteur en frais + snapshot pour la commande.
 * Lève ErreurLivraison si le mode n'est pas disponible.
 *
 * @returns {{ fraisLivraison: number, livraison: object }}
 */
export function resoudreLivraison(livraisonVendeur, { ville, sousTotal, mode, nomBoutique }) {
  if (!MODES_LIVRAISON.includes(mode)) {
    throw new ErreurLivraison(`Mode de livraison invalide pour « ${nomBoutique} ».`);
  }

  const option = calculerOptionsLivraison(livraisonVendeur, { ville, sousTotal })[mode];
  if (!option.disponible) {
    throw new ErreurLivraison(`${nomBoutique} : ${option.raison}`);
  }

  return {
    fraisLivraison: option.frais,
    livraison: {
      mode,
      zone:     option.zone ?? '',
      delaiMin: option.delaiMin ?? null,
      delaiMax: option.delaiMax ?? null,
      ...(mode === 'retrait' ? { pointRetrait: option.pointRetrait } : {}),
    },
  };
}
