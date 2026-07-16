import mongoose from 'mongoose';

/**
 * Modèle Vendeur — profil vendeur lié à un Utilisateur (User).
 * Créé lors de la demande d'inscription en tant que vendeur.
 */
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
      enum: ['individuel', 'sarl', 'sa', 'autre'],
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

const Vendeur = mongoose.model('Vendeur', vendeurSchema);
export default Vendeur;
