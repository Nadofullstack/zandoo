import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Le nom complet est requis'],
      trim: true,
      minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    email: {
      type: String,
      required: [true, "L'adresse e-mail est requise"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Adresse e-mail invalide'],
    },
    phone: {
      type: String,
      /* Non obligatoire pour les comptes créés via Google OAuth */
      required: false,
      default: '',
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
      select: false, // jamais retourné dans les requêtes par défaut
    },
    role: {
      type: String,
      enum: ['acheteur', 'vendeur', 'livreur', 'admin'],
      default: 'acheteur',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    /* Identifiant Google — présent uniquement pour les comptes créés via OAuth */
    googleId: {
      type: String,
      default: null,
    },
    /* URL de l'avatar Google */
    avatar: {
      type: String,
      default: null,
    },

    /* ── Champs pour le flux d'activation livreur ───────────────── */

    /** Indique que le livreur doit changer son mot de passe à la prochaine connexion */
    mustChangePassword: {
      type: Boolean,
      default: false,
      select: false,
    },

    /** Token signé envoyé par email pour l'activation du compte livreur */
    activationToken: {
      type: String,
      default: undefined,
      select: false,
    },

    /** Date d'expiration du token d'activation (48h) */
    activationTokenExp: {
      type: Date,
      default: undefined,
      select: false,
    },
  },
  {
    timestamps: true, // ajoute createdAt et updatedAt automatiquement
  }
);

/**
 * Hook pre-save : hache le mot de passe avant chaque enregistrement.
 * Ne s'exécute que si le champ password a été modifié.
 * Avec Mongoose 7+, un hook async ne doit pas appeler next() manuellement.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Méthode d'instance : compare un mot de passe en clair avec le hash stocké.
 * Retourne true si les mots de passe correspondent.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
