import mongoose from 'mongoose';

/**
 * Modèle Categorie — arborescence à deux niveaux (catégorie / sous-catégorie).
 * Une catégorie sans parent est une catégorie racine.
 */
const categorieSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom de la catégorie est requis'],
      trim: true,
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },

    /* Slug unique pour les URLs */
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    /* Référence vers la catégorie parente — null pour les catégories racine */
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categorie',
      default: null,
    },

    /**
     * Icône emoji ou identifiant d'icône généré automatiquement lors
     * de la création d'un produit dans cette catégorie.
     * Exemples : "👗", "📱", "🛒", "🍎"
     */
    icone: {
      type: String,
      default: null,
    },

    /* @deprecated — conservé pour compatibilité, utiliser icone */
    image: {
      type: String,
      default: null,
    },

    /**
     * Attributs spécifiques à la catégorie.
     * Exemple : [{ nom: "Taille", type: "liste", valeurs: ["S","M","L","XL"] }]
     */
    attributs: [
      {
        nom:     { type: String, required: true, trim: true, maxlength: 50 },
        type:    { type: String, enum: ['texte', 'liste', 'nombre', 'booleen'], default: 'texte' },
        valeurs: [{ type: String, trim: true }],  // Pour type "liste"
        requis:  { type: Boolean, default: false },
      },
    ],

    active: {
      type: Boolean,
      default: true,
    },

    /* Ordre d'affichage */
    ordre: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/* Index pour les recherches sur slug et parent */
// categorieSchema.index({ slug: 1 });
categorieSchema.index({ parent: 1 });

const Categorie = mongoose.model('Categorie', categorieSchema);
export default Categorie;
