import mongoose from 'mongoose';

/**
 * Favori — un produit mis de côté par un utilisateur.
 *
 * Collection dédiée (plutôt qu'un tableau dans User) :
 *  - volume non borné par utilisateur ;
 *  - comptage par produit (popularité, statistiques vendeur) ;
 *  - unicité garantie par index (utilisateur, produit).
 */
const favoriSchema = new mongoose.Schema(
  {
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    produit:     { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

favoriSchema.index({ utilisateur: 1, produit: 1 }, { unique: true });
favoriSchema.index({ utilisateur: 1, createdAt: -1 });
favoriSchema.index({ produit: 1 });

const Favori = mongoose.model('Favori', favoriSchema);
export default Favori;
