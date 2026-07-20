import mongoose from 'mongoose';

/**
 * Modèle Article — blog / actualités de la plateforme.
 */
const articleSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, 'Le titre est requis.'],
      trim: true,
      maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères.'],
    },

    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },

    /* Résumé court affiché dans les listes */
    resume: {
      type: String,
      trim: true,
      maxlength: [500, 'Le résumé ne peut pas dépasser 500 caractères.'],
      default: '',
    },

    /* Contenu HTML ou Markdown */
    contenu: {
      type: String,
      required: [true, 'Le contenu est requis.'],
      default: '',
    },

    /* Image de couverture */
    imageCouverture: { type: String, default: null },

    /* Catégorie éditoriale */
    categorieEditoriale: {
      type: String,
      enum: ['actualite', 'conseil', 'mise_a_jour', 'autre'],
      default: 'actualite',
    },

    /* Tags */
    tags: [{ type: String, trim: true, lowercase: true }],

    /* Statut */
    statut: {
      type: String,
      enum: ['brouillon', 'publie', 'archive'],
      default: 'brouillon',
    },

    /* Date de publication planifiée */
    publieAt: { type: Date, default: null },

    /* Auteur */
    auteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    /* Méta SEO */
    metaTitre:       { type: String, trim: true, maxlength: 70,  default: '' },
    metaDescription: { type: String, trim: true, maxlength: 160, default: '' },

    /* Statistiques */
    vues: { type: Number, default: 0 },
  },
  { timestamps: true }
);

articleSchema.index({ statut: 1, publieAt: -1 });
articleSchema.index({ slug: 1 });

/* Génération automatique du slug depuis le titre */
articleSchema.pre('save', function () {
  if (this.isModified('titre') && !this.slug) {
    this.slug = this.titre
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80);
  }
});

const Article = mongoose.model('Article', articleSchema);
export default Article;
