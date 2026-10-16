import Vendeur from '../../models/Vendeur.js';
import { normaliserVille } from '../../services/livraisonService.js';

/**
 * Politique de livraison de la boutique du vendeur connecté.
 *   GET /api/vendeur/livraison
 *   PUT /api/vendeur/livraison
 */

const MAX_ZONES = 20;
const TARIF_MAX = 1_000_000;

class ErreurValidation extends Error {}

/* ── Validation / normalisation du corps de requête ─────────────────────── */

const montant = (valeur, libelle, { nullable = false } = {}) => {
  if (nullable && (valeur === null || valeur === undefined || valeur === '')) return null;
  const n = Number(valeur);
  if (!Number.isFinite(n) || n < 0 || n > TARIF_MAX) {
    throw new ErreurValidation(`${libelle} : montant invalide (entre 0 et ${TARIF_MAX.toLocaleString('fr-FR')} FCFA).`);
  }
  return Math.round(n);
};

const delai = (valeur, libelle) => {
  const n = Number(valeur);
  if (!Number.isInteger(n) || n < 0 || n > 60) throw new ErreurValidation(`${libelle} : délai invalide (0 à 60 jours).`);
  return n;
};

const texte = (valeur, max) => String(valeur ?? '').trim().slice(0, max);

const paireDelais = (min, max, libelle) => {
  const dMin = delai(min, `${libelle} (minimum)`);
  const dMax = delai(max, `${libelle} (maximum)`);
  if (dMin > dMax) throw new ErreurValidation(`${libelle} : le délai minimum dépasse le maximum.`);
  return [dMin, dMax];
};

/** Construit une politique de livraison valide à partir du corps de requête. */
function normaliserPolitique(corps) {
  const domicile = corps.domicile ?? {};
  const retrait  = corps.retrait ?? {};

  const zonesBrutes = Array.isArray(domicile.zones) ? domicile.zones : [];
  if (zonesBrutes.length > MAX_ZONES) throw new ErreurValidation(`Maximum ${MAX_ZONES} zones de livraison.`);

  const villesVues = new Map();
  const zones = zonesBrutes.map((z, i) => {
    const nom = texte(z.nom, 60);
    if (!nom) throw new ErreurValidation(`Zone ${i + 1} : le nom est requis.`);

    const villes = [...new Set((Array.isArray(z.villes) ? z.villes : []).map((v) => texte(v, 60)).filter(Boolean))];
    if (villes.length === 0 || villes.length > 30) throw new ErreurValidation(`Zone « ${nom} » : indiquez entre 1 et 30 villes.`);

    /* Une ville ne peut appartenir qu'à une seule zone (sinon tarif ambigu) */
    for (const v of villes) {
      const cle = normaliserVille(v);
      if (villesVues.has(cle)) throw new ErreurValidation(`« ${v} » figure dans deux zones (${villesVues.get(cle)} et ${nom}).`);
      villesVues.set(cle, nom);
    }

    const [delaiMin, delaiMax] = paireDelais(z.delaiMin ?? 1, z.delaiMax ?? 3, `Zone « ${nom} »`);
    return { nom, villes, tarif: montant(z.tarif, `Zone « ${nom} »`), delaiMin, delaiMax };
  });

  const [delaiAutresVillesMin, delaiAutresVillesMax] = paireDelais(
    domicile.delaiAutresVillesMin ?? 3, domicile.delaiAutresVillesMax ?? 7, 'Autres villes',
  );

  const politique = {
    configuree: true,
    domicile: {
      actif: domicile.actif !== false,
      zones,
      tarifAutresVilles: montant(domicile.tarifAutresVilles, 'Tarif autres villes', { nullable: true }),
      delaiAutresVillesMin,
      delaiAutresVillesMax,
      gratuiteDes: montant(domicile.gratuiteDes, 'Seuil de gratuité', { nullable: true }),
    },
    retrait: {
      actif:        retrait.actif === true,
      adresse:      texte(retrait.adresse, 200),
      ville:        texte(retrait.ville, 60),
      horaires:     texte(retrait.horaires, 120),
      instructions: texte(retrait.instructions, 300),
    },
  };

  if (politique.retrait.actif && (!politique.retrait.adresse || !politique.retrait.ville)) {
    throw new ErreurValidation("Retrait en boutique : l'adresse et la ville du point de retrait sont requises.");
  }
  if (!politique.domicile.actif && !politique.retrait.actif) {
    throw new ErreurValidation('Proposez au moins un mode : livraison à domicile ou retrait en boutique.');
  }
  if (politique.domicile.actif && zones.length === 0 && politique.domicile.tarifAutresVilles === null) {
    throw new ErreurValidation('Livraison à domicile : ajoutez au moins une zone ou un tarif pour les autres villes.');
  }

  return politique;
}

/* ── Contrôleurs ──────────────────────────────────────────────────────────── */

export const getPolitiqueLivraison = async (req, res) => {
  try {
    /* Sans .lean() : Mongoose applique les valeurs par défaut aux boutiques
       créées avant l'ajout du module livraison (champ absent en base). */
    const vendeur = await Vendeur.findOne({ utilisateur: req.user._id }).select('livraison adresse');
    if (!vendeur) return res.status(404).json({ success: false, message: 'Boutique introuvable.' });

    const { livraison, adresse } = vendeur.toObject();
    return res.status(200).json({
      success: true,
      data: { livraison, adresseBoutique: adresse ?? null },
    });
  } catch (erreur) {
    console.error('Erreur getPolitiqueLivraison:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

export const mettreAJourPolitiqueLivraison = async (req, res) => {
  try {
    const livraison = normaliserPolitique(req.body ?? {});

    const vendeur = await Vendeur.findOneAndUpdate(
      { utilisateur: req.user._id },
      { $set: { livraison } },
      { returnDocument: 'after', runValidators: true },
    ).select('livraison adresse').lean();

    if (!vendeur) return res.status(404).json({ success: false, message: 'Boutique introuvable.' });

    return res.status(200).json({
      success: true,
      message: 'Politique de livraison enregistrée.',
      data: { livraison: vendeur.livraison, adresseBoutique: vendeur.adresse ?? null },
    });
  } catch (erreur) {
    if (erreur instanceof ErreurValidation) {
      return res.status(422).json({ success: false, message: erreur.message });
    }
    console.error('Erreur mettreAJourPolitiqueLivraison:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
