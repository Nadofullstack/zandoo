import mongoose from 'mongoose';

/**
 * Modèle Commande — représente une commande passée sur la plateforme.
 * Une commande appartient à un acheteur et contient plusieurs lignes de produits.
 */

/* ── Sous-schéma : ligne de commande ─────────────────────────────────── */
const ligneCommandeSchema = new mongoose.Schema(
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
    /* Snapshot du produit au moment de la commande */
    nomProduit:  { type: String, required: true, trim: true },
    photoProduit: { type: String, default: null },
    reference:   { type: String, trim: true, default: '' },

    quantite:    { type: Number, required: true, min: 1 },
    prixUnitaire: { type: Number, required: true, min: 0 },
    sousTotal:   { type: Number, required: true, min: 0 },

    /* Variante sélectionnée (ex: "Taille: L") */
    variante: { type: String, default: '' },
  },
  { _id: true }
);

/* ── Sous-schéma : adresse ───────────────────────────────────────────── */
const adresseSchema = new mongoose.Schema(
  {
    nomComplet: { type: String, required: true, trim: true },
    telephone:  { type: String, trim: true, default: '' },
    rue:        { type: String, trim: true, default: '' },
    ville:      { type: String, required: true, trim: true },
    pays:       { type: String, trim: true, default: 'Bénin' },
    codePostal: { type: String, trim: true, default: '' },
    instructions: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

/* ── Sous-schéma : informations de paiement ──────────────────────────── */
const paiementSchema = new mongoose.Schema(
  {
    methode: {
      type: String,
      enum: ['mobile_money', 'carte_bancaire', 'virement', 'especes', 'autre'],
      required: true,
    },
    statut: {
      type: String,
      enum: ['en_attente', 'paye', 'echoue', 'rembourse'],
      default: 'en_attente',
    },
    reference:   { type: String, trim: true, default: '' }, // ID transaction
    montant:     { type: Number, min: 0, default: 0 },
    devise:      { type: String, default: 'XOF' },
    payeAt:      { type: Date, default: null },
  },
  { _id: false }
);

/* ── Sous-schéma : historique de statut ──────────────────────────────── */
const historiqueStatutSchema = new mongoose.Schema(
  {
    statut:     { type: String, required: true },
    modifiePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    raison:     { type: String, trim: true, maxlength: 300, default: '' },
    modifieAt:  { type: Date, default: Date.now },
  },
  { _id: true }
);

/* ── Schéma principal ─────────────────────────────────────────────────── */
const commandeSchema = new mongoose.Schema(
  {
    /* Numéro de commande lisible (ex: CMD-20260001) */
    numero: {
      type: String,
      unique: true,
      trim: true,
    },

    acheteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    lignes: {
      type: [ligneCommandeSchema],
      validate: [(v) => v.length > 0, 'Une commande doit avoir au moins une ligne.'],
    },

    /* Montants */
    sousTotal:         { type: Number, required: true, min: 0 }, // avant frais
    fraisLivraison:    { type: Number, default: 0, min: 0 },
    remise:            { type: Number, default: 0, min: 0 },
    total:             { type: Number, required: true, min: 0 },
    devise:            { type: String, default: 'XOF' },

    /* Adresses */
    adresseLivraison:  { type: adresseSchema, required: true },
    adresseFacturation: { type: adresseSchema, default: null },

    /* Paiement */
    paiement: { type: paiementSchema, required: true },

    /* Livreur assigné */
    livreur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Livreur',
      default: null,
    },

    /* Statut de la commande */
    statut: {
      type: String,
      enum: ['en_attente', 'payee', 'expediee', 'livree', 'annulee'],
      default: 'en_attente',
    },

    /* Notes */
    notesClient: { type: String, trim: true, maxlength: 500, default: '' },
    notesAdmin:  { type: String, trim: true, maxlength: 500, default: '' },

    /* Dates clés */
    payeeAt:   { type: Date, default: null },
    expedieeAt: { type: Date, default: null },
    livreeAt:  { type: Date, default: null },
    annuleeAt: { type: Date, default: null },

    /* Historique des changements de statut */
    historiqueStatut: [historiqueStatutSchema],
  },
  {
    timestamps: true,
  }
);

/* ── Index pour les recherches fréquentes ────────────────────────────── */
commandeSchema.index({ acheteur: 1, createdAt: -1 });
commandeSchema.index({ statut: 1 });
// commandeSchema.index({ numero: 1 });

/* ── Génération automatique du numéro de commande ────────────────────── */
commandeSchema.pre('save', async function () {
  if (this.isNew && !this.numero) {
    const annee = new Date().getFullYear();
    const count = await mongoose.model('Commande').countDocuments();
    this.numero = `CMD-${annee}${String(count + 1).padStart(4, '0')}`;
  }
});

const Commande = mongoose.model('Commande', commandeSchema);
export default Commande;
