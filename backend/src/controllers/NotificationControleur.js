import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

/**
 * Notifications in-app de l'utilisateur connecté — /api/notifications.
 */

const erreurServeur = (res, contexte, erreur) => {
  console.error(`Erreur ${contexte}:`, erreur);
  return res.status(500).json({ success: false, message: 'Erreur serveur.' });
};

/* GET /?page=1&limite=20 */
export const getNotifications = async (req, res) => {
  try {
    const page   = Math.max(1, Number(req.query.page) || 1);
    const limite = Math.min(50, Math.max(1, Number(req.query.limite) || 20));
    const filtre = { destinataire: req.user._id };

    const [notifications, total, nonLues] = await Promise.all([
      Notification.find(filtre).sort({ createdAt: -1 }).skip((page - 1) * limite).limit(limite).lean(),
      Notification.countDocuments(filtre),
      Notification.countDocuments({ ...filtre, luAt: null }),
    ]);

    return res.status(200).json({
      success: true,
      data: { notifications, nonLues, pagination: { total, page, limite, totalPages: Math.ceil(total / limite) } },
    });
  } catch (erreur) {
    return erreurServeur(res, 'getNotifications', erreur);
  }
};

/* GET /non-lues */
export const getNombreNonLues = async (req, res) => {
  try {
    const nonLues = await Notification.countDocuments({ destinataire: req.user._id, luAt: null });
    return res.status(200).json({ success: true, data: { nonLues } });
  } catch (erreur) {
    return erreurServeur(res, 'getNombreNonLues', erreur);
  }
};

/* PATCH /:id/lue */
export const marquerNotificationLue = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'Notification introuvable.' });
    await Notification.updateOne({ _id: req.params.id, destinataire: req.user._id, luAt: null }, { $set: { luAt: new Date() } });
    return res.status(200).json({ success: true });
  } catch (erreur) {
    return erreurServeur(res, 'marquerNotificationLue', erreur);
  }
};

/* PATCH /tout-lire */
export const toutMarquerLu = async (req, res) => {
  try {
    await Notification.updateMany({ destinataire: req.user._id, luAt: null }, { $set: { luAt: new Date() } });
    return res.status(200).json({ success: true });
  } catch (erreur) {
    return erreurServeur(res, 'toutMarquerLu', erreur);
  }
};
