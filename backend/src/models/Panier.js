import mongoose from 'mongoose';

/**
 * Modèle Panier — panier persistant côté serveur.
 * Un acheteur = un panier. Les articles peuvent venir de plusieurs vendeurs.
 */

const ligneSchema = new mongoose.Schema(
  {
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true,
    },
    vendeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendeur',
      required: true,
    },
    quantite: {
      type: Number,
      required: true,
      min: [1, 'La quantité minimum est 1'],
      max: [99, 'La quantité maximum est 99'],
    },
    variante: { type: String, default: '' },
  },
  { _id: true }
);

const panierSchema = new mongoose.Schema(
  {
    acheteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    lignes: {
      type: [ligneSchema],
      default: [],
    },
    /** Date de dernière activité — pour TTL ou nettoyage */
    derniereActivite: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

/* Met à jour derniereActivite à chaque save */
panierSchema.pre('save', function () {
  this.derniereActivite = new Date();
});

// panierSchema.index({ acheteur: 1 });

const Panier = mongoose.model('Panier', panierSchema);
export default Panier;
