import mongoose from 'mongoose';

/**
 * Conversation entre un acheteur et une boutique.
 *
 * Une seule conversation par couple (acheteur, boutique) : les échanges sur
 * plusieurs produits d'une même boutique restent dans un fil unique, chaque
 * message pouvant porter une carte produit (voir Message.produit).
 *
 * Les compteurs de non-lus et le dernier message sont dénormalisés pour
 * afficher la liste des conversations sans agrégation.
 */
const conversationSchema = new mongoose.Schema(
  {
    acheteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendeur:  { type: mongoose.Schema.Types.ObjectId, ref: 'Vendeur', required: true },
    /** Compte utilisateur propriétaire de la boutique (destinataire côté vendeur) */
    vendeurUtilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    /** Dernier produit évoqué (contexte affiché en tête du fil) */
    produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', default: null },

    dernierMessage: {
      texte:      { type: String, default: '' },
      auteur:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      aProduit:   { type: Boolean, default: false },
      envoyeAt:   { type: Date, default: null },
    },

    nonLusAcheteur: { type: Number, default: 0, min: 0 },
    nonLusVendeur:  { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

conversationSchema.index({ acheteur: 1, vendeur: 1 }, { unique: true });
conversationSchema.index({ acheteur: 1, 'dernierMessage.envoyeAt': -1 });
conversationSchema.index({ vendeurUtilisateur: 1, 'dernierMessage.envoyeAt': -1 });

/** Rôle d'un utilisateur dans la conversation, ou null s'il n'y participe pas. */
conversationSchema.methods.roleDe = function (userId) {
  const id = String(userId);
  if (String(this.acheteur?._id ?? this.acheteur) === id) return 'acheteur';
  if (String(this.vendeurUtilisateur?._id ?? this.vendeurUtilisateur) === id) return 'vendeur';
  return null;
};

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
