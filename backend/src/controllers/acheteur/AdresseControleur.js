import User, { MAX_ADRESSES } from '../../models/User.js';

/**
 * Carnet d'adresses de l'utilisateur connecté.
 *
 * Invariants maintenus ici :
 *  - au plus MAX_ADRESSES adresses ;
 *  - exactement une adresse `parDefaut` dès qu'il en existe au moins une.
 */

const CHAMPS = ['libelle', 'nomComplet', 'telephone', 'ville', 'quartier', 'rue', 'pays', 'instructions'];

/** Copie uniquement les champs autorisés (évite l'assignation de masse) */
const extraireChamps = (corps) =>
  Object.fromEntries(CHAMPS.filter((c) => corps[c] !== undefined).map((c) => [c, String(corps[c]).trim()]));

/** Garantit qu'une seule adresse est par défaut (la plus récemment choisie, sinon la première) */
const normaliserParDefaut = (adresses, idPrioritaire = null) => {
  if (adresses.length === 0) return;
  const cible = (idPrioritaire && adresses.id(idPrioritaire)) || adresses.find((a) => a.parDefaut) || adresses[0];
  adresses.forEach((a) => { a.parDefaut = a._id.equals(cible._id); });
};

/** Adresses triées : par défaut en premier, puis les plus récentes */
const trier = (adresses) =>
  [...adresses].sort((a, b) => Number(b.parDefaut) - Number(a.parDefaut) || b.updatedAt - a.updatedAt);

const repondre = (res, user, status = 200, message) =>
  res.status(status).json({ success: true, ...(message ? { message } : {}), data: { adresses: trier(user.adresses) } });

/* GET /api/acheteur/adresses */
export const getMesAdresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('adresses');
    return repondre(res, user);
  } catch (erreur) {
    console.error('Erreur getMesAdresses:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* POST /api/acheteur/adresses */
export const ajouterAdresse = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('adresses');
    if (user.adresses.length >= MAX_ADRESSES) {
      return res.status(422).json({ success: false, message: `Vous pouvez enregistrer au maximum ${MAX_ADRESSES} adresses.` });
    }

    user.adresses.push(extraireChamps(req.body));
    const nouvelle = user.adresses.at(-1);
    normaliserParDefaut(user.adresses, req.body.parDefaut || user.adresses.length === 1 ? nouvelle._id : null);
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Adresse enregistrée.',
      data: { adresse: nouvelle, adresses: trier(user.adresses) },
    });
  } catch (erreur) {
    console.error('Erreur ajouterAdresse:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* PUT /api/acheteur/adresses/:id */
export const modifierAdresse = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('adresses');
    const adresse = user.adresses.id(req.params.id);
    if (!adresse) return res.status(404).json({ success: false, message: 'Adresse introuvable.' });

    adresse.set(extraireChamps(req.body));
    normaliserParDefaut(user.adresses, req.body.parDefaut ? adresse._id : null);
    await user.save();

    return repondre(res, user, 200, 'Adresse mise à jour.');
  } catch (erreur) {
    console.error('Erreur modifierAdresse:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* PATCH /api/acheteur/adresses/:id/par-defaut */
export const definirAdresseParDefaut = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('adresses');
    if (!user.adresses.id(req.params.id)) return res.status(404).json({ success: false, message: 'Adresse introuvable.' });

    normaliserParDefaut(user.adresses, req.params.id);
    await user.save();

    return repondre(res, user, 200, 'Adresse par défaut mise à jour.');
  } catch (erreur) {
    console.error('Erreur definirAdresseParDefaut:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* DELETE /api/acheteur/adresses/:id */
export const supprimerAdresse = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('adresses');
    const adresse = user.adresses.id(req.params.id);
    if (!adresse) return res.status(404).json({ success: false, message: 'Adresse introuvable.' });

    adresse.deleteOne();
    normaliserParDefaut(user.adresses); // une autre adresse devient par défaut si besoin
    await user.save();

    return repondre(res, user, 200, 'Adresse supprimée.');
  } catch (erreur) {
    console.error('Erreur supprimerAdresse:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
