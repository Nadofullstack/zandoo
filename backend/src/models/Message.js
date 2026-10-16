import mongoose from 'mongoose';

/**
 * Message d'une conversation acheteur ⇄ boutique.
 * `produit` est un instantané (nom, photo, prix au moment de l'envoi) : la carte
 * reste fidèle à ce qui a été discuté même si le produit change ensuite.
 */
const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    auteur:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roleAuteur:   { type: String, enum: ['acheteur', 'vendeur'], required: true },

    texte: { type: String, trim: true, maxlength: 2000, default: '' },

    produit: {
      type: new mongoose.Schema(
        {
          _id:              { type: mongoose.Schema.Types.ObjectId, ref: 'Produit' },
          nom:              String,
          slug:             String,
          photo:            String,
          prix:             Number,
          prixPromotionnel: Number,
        },
        { _id: false }
      ),
      default: null,
    },

    luAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ conversation: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
