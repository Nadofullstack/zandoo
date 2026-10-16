import mongoose from 'mongoose';

/**
 * Notification in-app d'un utilisateur (cloche).
 * Créée par services/notificationService.js, qui la pousse aussi en temps réel.
 */
export const TYPES_NOTIFICATION = [
  'commande_nouvelle',   // vendeur : une commande arrive
  'commande_statut',     // acheteur : sa commande avance (confirmée, expédiée, livrée…)
  'commande_annulee',    // vendeur ou acheteur : annulation
  'avis_nouveau',        // vendeur : un client a noté un produit
  'avis_reponse',        // acheteur : la boutique a répondu à son avis
  'systeme',             // annonces de la plateforme
];

const notificationSchema = new mongoose.Schema(
  {
    destinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:         { type: String, enum: TYPES_NOTIFICATION, required: true },
    titre:        { type: String, required: true, trim: true, maxlength: 120 },
    contenu:      { type: String, trim: true, maxlength: 300, default: '' },
    /** Page à ouvrir au clic (chemin interne, ex. /mes-commandes/…) */
    lien:         { type: String, trim: true, default: '' },
    luAt:         { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ destinataire: 1, createdAt: -1 });
notificationSchema.index({ destinataire: 1, luAt: 1 });
/* Purge automatique après 90 jours */
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
