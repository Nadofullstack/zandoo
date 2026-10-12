import mongoose from 'mongoose';
import Publicite from '../../models/Publicite.js';

/**
 * Mesure d'audience des campagnes (public, sans authentification).
 *   POST /api/acheteur/publicites/impressions   { ids: [...] }  — campagnes réellement vues
 *   POST /api/acheteur/publicites/:id/clic
 *
 * Le client déduplique par session ; le serveur ne compte que les campagnes actives.
 * Réponse 204 : rien à renvoyer, et un échec ne doit jamais gêner la navigation.
 */

const MAX_LOT = 20;

export const enregistrerImpressions = async (req, res) => {
  try {
    const ids = (Array.isArray(req.body?.ids) ? req.body.ids : [])
      .filter((id) => mongoose.isValidObjectId(id))
      .slice(0, MAX_LOT);

    if (ids.length) {
      await Publicite.updateMany({ _id: { $in: ids }, statut: 'active' }, { $inc: { impressions: 1 } });
    }
    return res.status(204).end();
  } catch (erreur) {
    console.error('Erreur enregistrerImpressions:', erreur.message);
    return res.status(204).end();
  }
};

export const enregistrerClic = async (req, res) => {
  try {
    if (mongoose.isValidObjectId(req.params.id)) {
      await Publicite.updateOne({ _id: req.params.id, statut: 'active' }, { $inc: { clics: 1 } });
    }
    return res.status(204).end();
  } catch (erreur) {
    console.error('Erreur enregistrerClic:', erreur.message);
    return res.status(204).end();
  }
};
