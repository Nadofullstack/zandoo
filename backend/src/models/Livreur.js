import mongoose from 'mongoose';

/**
 * Modèle Livreur — profil livreur lié à un Utilisateur (User).
 * Créé par l'administrateur lors de la création du compte livreur.
 * Le livreur complète son profil lors de sa première connexion.
 */
const livreurSchema = new mongoose.Schema(
  {
    /* Référence vers l'utilisateur propriétaire du compte */
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    /* ── Informations véhicule ─────────────────────────────────── */
    typeVehicule: {
      type: String,
      enum: ['moto', 'velo', 'voiture', 'camionnette', 'autre'],
      default: null,
    },
    numeroplaque: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Numéro de plaque invalide'],
      default: null,
    },

    /* ── Zone de livraison ────────────────────────────────────── */
    villeService: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    zonelivraison: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },

    /* ── Contact ──────────────────────────────────────────────── */
    telephone: {
      type: String,
      trim: true,
      default: null,
    },

    /* ── Statut de validation ─────────────────────────────────── */
    statut: {
      type: String,
      enum: ['en_attente', 'actif', 'suspendu'],
      default: 'en_attente',
    },

    /* Indique si le profil a été complété après la première connexion */
    profilComplete: {
      type: Boolean,
      default: false,
    },

    /* Notes internes de l'administrateur */
    notesAdmin: {
      type: String,
      maxlength: 500,
      default: '',
    },

    /* Historique des changements de statut */
    historiqueStatut: [
      {
        statut:     { type: String, enum: ['en_attente', 'actif', 'suspendu'] },
        modifiePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        raison:     { type: String, maxlength: 300 },
        modifieAt:  { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Livreur = mongoose.model('Livreur', livreurSchema);
export default Livreur;
