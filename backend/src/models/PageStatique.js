import mongoose from 'mongoose';

/**
 * Modèle PageStatique — contenu des pages fixes du site.
 * Ex : À propos, CGU, CGV, Politique de confidentialité, FAQ.
 */
const pageStatiqueSchema = new mongoose.Schema(
  {
    /* Identifiant unique lisible (ex: a-propos, cgu, faq) */
    slug: {
      type: String,
      required: [true, 'Le slug est requis.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres, chiffres et tirets.'],
    },

    titre: {
      type: String,
      required: [true, 'Le titre est requis.'],
      trim: true,
      maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères.'],
    },

    /* Contenu HTML ou Markdown */
    contenu: {
      type: String,
      required: [true, 'Le contenu est requis.'],
      default: '',
    },

    /* Méta SEO */
    metaTitre:       { type: String, trim: true, maxlength: 70,  default: '' },
    metaDescription: { type: String, trim: true, maxlength: 160, default: '' },

    /* Visibilité publique */
    publiee: { type: Boolean, default: false },

    /* Ordre dans le menu/footer */
    ordre: { type: Number, default: 0 },

    /* Dernière modification par */
    modifiePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// pageStatiqueSchema.index({ slug: 1 });

const PageStatique = mongoose.model('PageStatique', pageStatiqueSchema);
export default PageStatique;
