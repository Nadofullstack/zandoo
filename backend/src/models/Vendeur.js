import mongoose from 'mongoose';
import slugify from 'slugify';

/**
 * Modèle Vendeur — profil vendeur lié à un Utilisateur (User).
 * Créé lors de la demande d'inscription en tant que vendeur.
 */

/* ── Livraison : zone tarifaire définie par le vendeur ──────────────────── */
const zoneLivraisonSchema = new mongoose.Schema(
  {
    nom:      { type: String, required: true, trim: true, maxlength: 60 },   // ex: "Cotonou et environs"
    villes:   {
      type: [{ type: String, trim: true, maxlength: 60 }],
      validate: [(v) => v.length > 0 && v.length <= 30, 'Une zone doit contenir entre 1 et 30 villes.'],
    },
    tarif:    { type: Number, required: true, min: 0 },
    delaiMin: { type: Number, min: 0, max: 60, default: 1 },   // en jours
    delaiMax: { type: Number, min: 0, max: 60, default: 3 },
  },
  { _id: true }
);

const livraisonSchema = new mongoose.Schema(
  {
    /** false tant que le vendeur n'a jamais enregistré sa politique de livraison */
    configuree: { type: Boolean, default: false },

    domicile: {
      actif: { type: Boolean, default: true },
      zones: { type: [zoneLivraisonSchema], default: [] },
      /** Tarif pour les villes hors zones ; null = pas de livraison hors zones */
      tarifAutresVilles:    { type: Number, min: 0, default: null },
      delaiAutresVillesMin: { type: Number, min: 0, max: 60, default: 3 },
      delaiAutresVillesMax: { type: Number, min: 0, max: 60, default: 7 },
      /** Livraison offerte à partir de ce sous-total (null = jamais) */
      gratuiteDes: { type: Number, min: 0, default: null },
    },

    retrait: {
      actif:        { type: Boolean, default: false },
      adresse:      { type: String, trim: true, maxlength: 200, default: '' },
      ville:        { type: String, trim: true, maxlength: 60, default: '' },
      horaires:     { type: String, trim: true, maxlength: 120, default: '' },  // ex: "Lun–Sam, 9h–18h"
      instructions: { type: String, trim: true, maxlength: 300, default: '' },
    },
  },
  { _id: false }
);

const vendeurSchema = new mongoose.Schema(
  {
    /* Référence vers l'utilisateur propriétaire du compte */
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    /* Informations entreprise */
    nomEntreprise: {
      type: String,
      required: [true, "Le nom de l'entreprise est requis"],
      trim: true,
      maxlength: [150, "Le nom de l'entreprise ne peut pas dépasser 150 caractères"],
    },
    typeEntreprise: {
      type: String,
      enum: ['individuel','organisation', 'autre'],
      default: 'individuel',
    },
    secteurActivite: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    adresse: {
      rue:  { type: String, trim: true },
      ville: { type: String, trim: true },
      pays:  { type: String, trim: true, default: 'Bénin' },
    },

    /* Contact */
    emailContact: {
      type: String,
      trim: true,
      lowercase: true,
    },
    telephoneContact: {
      type: String,
      trim: true,
    },

    /* Documents légaux (URLs de fichiers stockés) */
    documents: {
      rccm:              { type: String, default: null }, // Registre du Commerce
      ifu:               { type: String, default: null }, // Identifiant Fiscal Unique
      carteIdentite:     { type: String, default: null }, // Pièce d'identité
      autresDocuments:   [{ type: String }],
    },

    /* Statut de validation */
    statut: {
      type: String,
      enum: ['en_attente', 'approuve', 'suspendu'],
      default: 'en_attente',
    },

    /* Notes internes de l'administrateur */
    notesAdmin: {
      type: String,
      maxlength: 500,
      default: '',
    },

    /* ── Boutique ───────────────────────────────────────────────────────── */
    slug: {
      type: String,
      unique: true,
      sparse: true, // null autorisé avant création boutique
      trim: true,
      lowercase: true,
    },
    logo: {
      type: String,
      default: null,
      trim: true,
    },
    banniere: {
      type: String,
      default: null,
      trim: true,
    },
    descriptionBoutique: {
      type: String,
      trim: true,
      maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères'],
      default: '',
    },

    /**
     * Politique de livraison de la boutique (tarifs fixés par le vendeur).
     * Les frais sont calculés côté serveur par services/livraisonService.js.
     * Boutique non configurée (`configuree: false`) : livraison à domicile offerte.
     */
    livraison: {
      type: livraisonSchema,
      default: () => ({}),
    },

    /* Conditions d'utilisation acceptées */
    conditionsAcceptees: {
      type: Boolean,
      default: false,
    },
    conditionsAccepteesAt: {
      type: Date,
      default: null,
    },

    /* Historique des changements de statut */
    historiqueStatut: [
      {
        statut:      { type: String, enum: ['en_attente', 'approuve', 'suspendu'] },
        modifiePar:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        raison:      { type: String, maxlength: 300 },
        modifieAt:   { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

/* ── Slug public de la boutique (URL /boutique/:slug) ──────────────────────
   Généré une seule fois à partir du nom : il reste stable si la boutique est
   renommée, pour ne pas casser les liens partagés ni le référencement. */
vendeurSchema.statics.genererSlugUnique = async function (nom, idExclu = null) {
  const base = slugify(String(nom || 'boutique'), { lower: true, strict: true, locale: 'fr' }).slice(0, 60) || 'boutique';
  let slug = base;
  for (let n = 2; await this.exists({ slug, ...(idExclu ? { _id: { $ne: idExclu } } : {}) }); n += 1) {
    slug = `${base}-${n}`;
  }
  return slug;
};

vendeurSchema.pre('validate', async function () {
  if (!this.slug && this.nomEntreprise) {
    this.slug = await this.constructor.genererSlugUnique(this.nomEntreprise, this._id);
  }
});

const Vendeur = mongoose.model('Vendeur', vendeurSchema);
export default Vendeur;
