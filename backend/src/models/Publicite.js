import mongoose from 'mongoose';

/**
 * Modèle Publicite — campagne publicitaire interne.
 * Gère bannières, mises en avant de produits et de vendeurs.
 */
const publiciteSchema = new mongoose.Schema(
  {
    /* Titre interne (non visible côté client) */
    titre: {
      type: String,
      required: [true, 'Le titre est requis.'],
      trim: true,
      maxlength: [150, 'Le titre ne peut pas dépasser 150 caractères.'],
    },

    /* Type de campagne */
    type: {
      type: String,
      enum: ['banniere', 'mise_en_avant_produit', 'mise_en_avant_vendeur'],
      required: [true, 'Le type est requis.'],
    },

    /* Emplacement d'affichage */
    emplacement: {
      type: String,
      enum: ['accueil_haut', 'accueil_milieu', 'sidebar', 'page_categorie', 'page_produit'],
      required: [true, "L'emplacement est requis."],
    },

    /* Contenu visuel */
    imageUrl:   { type: String, trim: true, default: null },
    lienCible:  { type: String, trim: true, default: '' }, // URL de redirection au clic
    texteAlt:   { type: String, trim: true, default: '' }, // Texte alternatif accessibilité

    /* Référence optionnelle vers un produit ou vendeur mis en avant */
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      default: null,
    },
    vendeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendeur',
      default: null,
    },

    /* Planification */
    dateDebut: { type: Date, required: [true, 'La date de début est requise.'] },
    dateFin:   { type: Date, required: [true, 'La date de fin est requise.']   },

    /* Statut */
    statut: {
      type: String,
      enum: ['brouillon', 'active', 'pausee', 'expiree'],
      default: 'brouillon',
    },

    /* Ordre d'affichage (plus petit = affiché en premier) */
    ordre: { type: Number, default: 0 },

    /* Statistiques simples */
    impressions: { type: Number, default: 0 },
    clics:       { type: Number, default: 0 },

    /* Créé par */
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

publiciteSchema.index({ statut: 1, emplacement: 1 });
publiciteSchema.index({ dateDebut: 1, dateFin: 1 });

const Publicite = mongoose.model('Publicite', publiciteSchema);
export default Publicite;
