import mongoose from 'mongoose';

/**
 * Modèle Commande — Architecture marketplace.
 *
 * Règle fondamentale : UNE commande = UN vendeur.
 * Lors d'un checkout multi-boutiques, le service crée autant de commandes
 * que de vendeurs distincts dans le panier, toutes liées au même
 * `groupeCommandeId` (UUID généré côté service).
 *
 * Ainsi :
 *  - L'acheteur vit un seul passage en caisse.
 *  - Chaque vendeur ne voit que ses propres commandes.
 *  - L'admin a une vue globale via `Commande.find()`.
 */

/* ── Sous-schéma : ligne de commande ─────────────────────────────────── */
const ligneCommandeSchema = new mongoose.Schema(
  {
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true,
    },

    /* Snapshot immuable du produit au moment de la commande */
    nomProduit:   { type: String, required: true, trim: true },
    photoProduit: { type: String, default: null },
    reference:    { type: String, trim: true, default: '' },
    variante:     { type: String, default: '' },

    quantite:     { type: Number, required: true, min: 1 },
    prixUnitaire: { type: Number, required: true, min: 0 },
    sousTotal:    { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

/* ── Sous-schéma : adresse ───────────────────────────────────────────── */
const adresseSchema = new mongoose.Schema(
  {
    nomComplet:   { type: String, required: true, trim: true },
    telephone:    { type: String, trim: true, default: '' },
    rue:          { type: String, trim: true, default: '' },
    ville:        { type: String, required: true, trim: true },
    pays:         { type: String, trim: true, default: 'Bénin' },
    codePostal:   { type: String, trim: true, default: '' },
    instructions: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

/* ── Sous-schéma : paiement ──────────────────────────────────────────── */
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
    reference: { type: String, trim: true, default: '' }, // ID transaction passerelle
    montant:   { type: Number, min: 0, default: 0 },
    devise:    { type: String, default: 'XOF' },
    payeAt:    { type: Date, default: null },
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

/* ── Statuts possibles ────────────────────────────────────────────────── */
export const STATUTS_COMMANDE = ['en_attente', 'payee', 'en_preparation', 'expediee', 'livree', 'annulee', 'remboursee'];

/* ── Schéma principal ─────────────────────────────────────────────────── */
const commandeSchema = new mongoose.Schema(
  {
    /**
     * Identifiant partagé entre toutes les sous-commandes issues
     * du même panier. Permet à l'acheteur de les regrouper visuellement.
     */
    groupeCommandeId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    /** Numéro lisible unique (ex: CMD-20260001) */
    numero: {
      type: String,
      unique: true,
      trim: true,
    },

    /** L'acheteur qui a passé la commande */
    acheteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    /** Le vendeur de cette commande (une commande = un seul vendeur) */
    vendeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendeur',
      required: true,
    },

    /** Lignes de produits — tous du même vendeur */
    lignes: {
      type: [ligneCommandeSchema],
      validate: [(v) => v.length > 0, 'Une commande doit avoir au moins une ligne.'],
    },

    /* ── Montants ───────────────────────────────────────────────────── */
    sousTotal:       { type: Number, required: true, min: 0 },
    fraisLivraison:  { type: Number, default: 0, min: 0 },
    remise:          { type: Number, default: 0, min: 0 },
    total:           { type: Number, required: true, min: 0 },
    devise:          { type: String, default: 'XOF' },

    /* ── Adresses ───────────────────────────────────────────────────── */
    adresseLivraison:   { type: adresseSchema, required: true },
    adresseFacturation: { type: adresseSchema, default: null },

    /* ── Paiement ───────────────────────────────────────────────────── */
    paiement: { type: paiementSchema, required: true },

    /* ── Livreur assigné (par l'admin) ──────────────────────────────── */
    livreur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Livreur',
      default: null,
    },

    /* ── Statut ─────────────────────────────────────────────────────── */
    statut: {
      type: String,
      enum: STATUTS_COMMANDE,
      default: 'en_attente',
    },

    /* ── Notes ──────────────────────────────────────────────────────── */
    notesClient: { type: String, trim: true, maxlength: 500, default: '' },
    notesAdmin:  { type: String, trim: true, maxlength: 500, default: '' },
    notesVendeur: { type: String, trim: true, maxlength: 500, default: '' },

    /* ── Dates clés ─────────────────────────────────────────────────── */
    payeeAt:        { type: Date, default: null },
    enPreparationAt: { type: Date, default: null },
    expedieeAt:     { type: Date, default: null },
    livreeAt:       { type: Date, default: null },
    annuleeAt:      { type: Date, default: null },
    remboureeAt:    { type: Date, default: null },

    /* ── Historique des changements de statut ───────────────────────── */
    historiqueStatut: [historiqueStatutSchema],
  },
  { timestamps: true }
);

/* ── Index ────────────────────────────────────────────────────────────── */
commandeSchema.index({ acheteur: 1, createdAt: -1 });
commandeSchema.index({ vendeur: 1, createdAt: -1 });
commandeSchema.index({ statut: 1 });
commandeSchema.index({ groupeCommandeId: 1, acheteur: 1 });

/* ── Génération automatique du numéro ────────────────────────────────── */
commandeSchema.pre('save', async function () {
  if (this.isNew && !this.numero) {
    const maintenant = new Date();
    const annee  = maintenant.getFullYear();
    const mois   = String(maintenant.getMonth() + 1).padStart(2, '0');
    const jour   = String(maintenant.getDate()).padStart(2, '0');

    // Compte les commandes créées aujourd'hui pour obtenir la séquence journalière
    const debutJour = new Date(annee, maintenant.getMonth(), maintenant.getDate(), 0, 0, 0);
    const finJour   = new Date(annee, maintenant.getMonth(), maintenant.getDate(), 23, 59, 59);

    const countJour = await mongoose.model('Commande').countDocuments({
      createdAt: { $gte: debutJour, $lte: finJour },
    });

    const seq = String(countJour + 1).padStart(4, '0');
    this.numero = `CMD-${annee}${mois}${jour}-${seq}`;
  }
});

const Commande = mongoose.model('Commande', commandeSchema);
export default Commande;
