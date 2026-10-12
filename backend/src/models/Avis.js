import mongoose from 'mongoose';

/**
 * Avis client sur un produit.
 *
 * Règles :
 *  - achat vérifié : l'acheteur doit avoir une commande LIVRÉE contenant le produit ;
 *  - un seul avis par (acheteur, produit), modifiable ;
 *  - le vendeur peut publier une réponse ;
 *  - l'admin peut masquer un avis (modération) sans le supprimer.
 *
 * La note moyenne et le nombre d'avis sont dénormalisés sur Produit
 * (services/avisService.js → recalculerNoteProduit).
 */
const avisSchema = new mongoose.Schema(
  {
    produit:  { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true },
    vendeur:  { type: mongoose.Schema.Types.ObjectId, ref: 'Vendeur', required: true },
    acheteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    /** Commande livrée qui justifie l'achat vérifié */
    commande: { type: mongoose.Schema.Types.ObjectId, ref: 'Commande', required: true },

    note: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: { validator: Number.isInteger, message: 'La note doit être un entier de 1 à 5.' },
    },
    titre:       { type: String, trim: true, maxlength: 100, default: '' },
    commentaire: { type: String, trim: true, maxlength: 1000, default: '' },

    reponseVendeur: {
      texte:     { type: String, trim: true, maxlength: 1000, default: '' },
      reponduAt: { type: Date, default: null },
    },

    statut:         { type: String, enum: ['publie', 'masque'], default: 'publie' },
    motifMasquage:  { type: String, trim: true, maxlength: 300, default: '' },
    modifieAt:      { type: Date, default: null },   // dernière modification par l'acheteur
  },
  { timestamps: true }
);

avisSchema.index({ acheteur: 1, produit: 1 }, { unique: true });
avisSchema.index({ produit: 1, statut: 1, createdAt: -1 });
avisSchema.index({ vendeur: 1, createdAt: -1 });

const Avis = mongoose.model('Avis', avisSchema);
export default Avis;
