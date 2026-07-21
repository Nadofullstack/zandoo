import mongoose from 'mongoose';

/**
 * Modèle Reclamation — système de tickets de support.
 * Un ticket est ouvert par un utilisateur (acheteur ou vendeur)
 * et géré par l'administration.
 */

/* ── Sous-schéma : message dans le fil de discussion ─────────────────── */
const messageSchema = new mongoose.Schema(
  {
    auteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roleAuteur: {
      type: String,
      enum: ['acheteur', 'vendeur', 'admin'],
      required: true,
    },
    contenu: {
      type: String,
      required: [true, 'Le contenu du message est requis.'],
      trim: true,
      maxlength: [2000, 'Le message ne peut pas dépasser 2000 caractères.'],
    },
    /* Pièces jointes (URLs) */
    piecesJointes: [{ type: String, trim: true }],
    lu: { type: Boolean, default: false },
    luAt: { type: Date, default: null },
  },
  { timestamps: true }
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
const reclamationSchema = new mongoose.Schema(
  {
    /* Numéro de ticket lisible (ex: TKT-2026-0001) */
    numero: {
      type: String,
      unique: true,
      trim: true,
    },

    /* Utilisateur qui ouvre le ticket */
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roleUtilisateur: {
      type: String,
      enum: ['acheteur', 'vendeur'],
      required: true,
    },

    /* Commande liée (optionnel) */
    commande: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commande',
      default: null,
    },

    /* Catégorie du ticket */
    categorie: {
      type: String,
      enum: [
        'produit_non_recu',
        'produit_defectueux',
        'produit_non_conforme',
        'remboursement',
        'vendeur',
        'paiement',
        'compte',
        'autre',
      ],
      required: [true, 'La catégorie est requise.'],
    },

    /* Informations principales */
    sujet: {
      type: String,
      required: [true, 'Le sujet est requis.'],
      trim: true,
      maxlength: [150, 'Le sujet ne peut pas dépasser 150 caractères.'],
    },
    description: {
      type: String,
      required: [true, 'La description est requise.'],
      trim: true,
      maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères.'],
    },

    /* Priorité */
    priorite: {
      type: String,
      enum: ['basse', 'normale', 'haute', 'urgente'],
      default: 'normale',
    },

    /* Statut du ticket */
    statut: {
      type: String,
      enum: ['ouvert', 'en_cours', 'en_attente_reponse', 'resolu', 'ferme'],
      default: 'ouvert',
    },

    /* Admin assigné au ticket */
    assigneA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    /* Fil de discussion */
    messages: [messageSchema],

    /* Notes internes admin (non visibles par l'utilisateur) */
    notesAdmin: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    /* Dates clés */
    resoluAt: { type: Date, default: null },
    fermeAt:  { type: Date, default: null },

    /* Historique des changements de statut */
    historiqueStatut: [historiqueStatutSchema],
  },
  {
    timestamps: true,
  }
);

/* ── Index ────────────────────────────────────────────────────────────── */
reclamationSchema.index({ utilisateur: 1, createdAt: -1 });
reclamationSchema.index({ statut: 1 });
// reclamationSchema.index({ numero: 1 });
reclamationSchema.index({ assigneA: 1 });

/* ── Génération automatique du numéro de ticket ──────────────────────── */
reclamationSchema.pre('save', async function () {
  if (this.isNew && !this.numero) {
    const annee = new Date().getFullYear();
    const count = await mongoose.model('Reclamation').countDocuments();
    this.numero = `TKT-${annee}-${String(count + 1).padStart(4, '0')}`;
  }
});

const Reclamation = mongoose.model('Reclamation', reclamationSchema);
export default Reclamation;
