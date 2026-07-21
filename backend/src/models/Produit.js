import mongoose from 'mongoose';

/**
 * Modèle Produit — catalogue complet avec variantes, médias et attributs dynamiques.
 */
const produitSchema = new mongoose.Schema(
  {
    /* ── Informations de base ───────────────────────────────────────────── */
    nom: {
      type: String,
      required: [true, 'Le nom du produit est requis'],
      trim: true,
      maxlength: [255, 'Le nom ne peut pas dépasser 255 caractères'],
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
      required: [true, 'La description est requise'],
      maxlength: [10000, 'La description ne peut pas dépasser 10 000 caractères'],
    },

    /* Référence unique du produit (SKU) */
    reference: {
      type: String,
      required: [true, 'La référence produit est requise'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [50, 'La référence ne peut pas dépasser 50 caractères'],
    },

    /* ── Médias ─────────────────────────────────────────────────────────── */
    photos: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'Maximum 10 photos par produit',
      },
      default: [],
    },

    video: {
      type: String,
      default: null,
      trim: true,
    },

    /* ── Catégorie ──────────────────────────────────────────────────────── */
    categorie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categorie',
      required: [true, 'La catégorie est requise'],
    },

    /* ── Vendeur propriétaire ───────────────────────────────────────────── */
    vendeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendeur',
      required: [true, 'Le vendeur est requis'],
    },

    /* ── Prix ───────────────────────────────────────────────────────────── */
    prix: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix ne peut pas être négatif'],
    },

    prixPromotionnel: {
      type: Number,
      default: null,
      min: [0, 'Le prix promotionnel ne peut pas être négatif'],
      validate: {
        validator: function (val) {
          /* Le prix promo doit être strictement inférieur au prix normal */
          if (val === null || val === undefined) return true;
          return val < this.prix;
        },
        message: 'Le prix promotionnel doit être inférieur au prix normal',
      },
    },

    /* ── Stock ──────────────────────────────────────────────────────────── */
    quantiteDisponible: {
      type: Number,
      required: [true, 'La quantité est requise'],
      min: [0, 'La quantité ne peut pas être négative'],
      validate: {
        validator: Number.isInteger,
        message: 'La quantité doit être un entier',
      },
    },

    enStock: {
      type: Boolean,
      default: true,
    },

    /* ── Variantes ──────────────────────────────────────────────────────── */
    /**
     * Exemple : [{ nom: "Taille", valeurs: ["S", "M", "L"] }]
     */
    variantes: [
      {
        nom:     { type: String, required: true, trim: true, maxlength: 50 },
        valeurs: [{ type: String, trim: true, maxlength: 50 }],
      },
    ],

    /* ── Attributs dynamiques (issus de la catégorie) ───────────────────── */
    attributs: [
      {
        nom:    { type: String, trim: true },
        valeur: { type: String, trim: true },
      },
    ],

    /* ── Statut de validation ───────────────────────────────────────────── */
    statut: {
      type: String,
      enum: ['en_attente', 'approuve', 'rejete', 'brouillon'],
      default: 'en_attente',
    },

    /* Motif de rejet renseigné par l'admin */
    motifRejet: {
      type: String,
      maxlength: 500,
      default: '',
    },

    /* Notes internes admin */
    notesAdmin: {
      type: String,
      maxlength: 500,
      default: '',
    },

    /* Historique des changements de statut */
    historiqueStatut: [
      {
        statut:      { type: String, enum: ['en_attente', 'approuve', 'rejete', 'brouillon'] },
        modifiePar:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        raison:      { type: String, maxlength: 500 },
        modifieAt:   { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

/* Index pour les recherches fréquentes */
produitSchema.index({ nom: 'text', description: 'text', reference: 'text' });
produitSchema.index({ categorie: 1, statut: 1 });
produitSchema.index({ vendeur: 1, statut: 1 });
// produitSchema.index({ slug: 1 });
// produitSchema.index({ reference: 1 });

const Produit = mongoose.model('Produit', produitSchema);
export default Produit;
