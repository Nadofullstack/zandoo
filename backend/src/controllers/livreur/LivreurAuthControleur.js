import jwt    from 'jsonwebtoken';
import User    from '../../models/User.js';
import Livreur from '../../models/Livreur.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */

const REGEX_MDP_FORT = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

/** Pose le cookie JWT httpOnly */
function setCookieToken(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });
}

function genererToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/livreur/activation/:token/verifier
   Vérifie la validité du token d'activation sans consommer le token.
───────────────────────────────────────────────────────────────────────────── */
export const verifierTokenActivation = async (req, res) => {
  try {
    const { token } = req.params;

    const utilisateur = await User.findOne({
      activationToken:    token,
      activationTokenExp: { $gt: new Date() },
      role:               'livreur',
    }).select('fullName email activationTokenExp');

    if (!utilisateur) {
      return res.status(400).json({
        success: false,
        message: 'Ce lien d\'activation est invalide ou a expiré.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        nomComplet:  utilisateur.fullName,
        email:       utilisateur.email,
        expireAt:    utilisateur.activationTokenExp,
      },
    });
  } catch (erreur) {
    console.error('Erreur verifierTokenActivation:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/livreur/activation/:token/changer-mot-de-passe
   Première connexion — changement du mot de passe temporaire.
───────────────────────────────────────────────────────────────────────────── */
export const changerMotDePasseInitial = async (req, res) => {
  try {
    const { token } = req.params;
    const { motDePasseTemp, nouveauMotDePasse, confirmationMotDePasse } = req.body;

    /* Validation des champs */
    if (!motDePasseTemp || !nouveauMotDePasse || !confirmationMotDePasse) {
      return res.status(422).json({
        success: false,
        message: 'Tous les champs sont obligatoires.',
      });
    }

    if (nouveauMotDePasse !== confirmationMotDePasse) {
      return res.status(422).json({
        success: false,
        message: 'Les mots de passe ne correspondent pas.',
        errors: [{ field: 'confirmationMotDePasse', message: 'Les mots de passe ne correspondent pas.' }],
      });
    }

    if (!REGEX_MDP_FORT.test(nouveauMotDePasse)) {
      return res.status(422).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
        errors: [{ field: 'nouveauMotDePasse', message: 'Mot de passe trop faible.' }],
      });
    }

    /* Récupération de l'utilisateur via le token */
    const utilisateur = await User.findOne({
      activationToken:    token,
      activationTokenExp: { $gt: new Date() },
      role:               'livreur',
    }).select('+password +mustChangePassword +activationToken +activationTokenExp');

    if (!utilisateur) {
      return res.status(400).json({
        success: false,
        message: 'Ce lien d\'activation est invalide ou a expiré. Contactez votre administrateur.',
      });
    }

    /* Vérification du mot de passe temporaire */
    const mdpTempValide = await utilisateur.comparePassword(motDePasseTemp);
    if (!mdpTempValide) {
      return res.status(401).json({
        success: false,
        message: 'Le mot de passe temporaire est incorrect.',
        errors: [{ field: 'motDePasseTemp', message: 'Mot de passe temporaire incorrect.' }],
      });
    }

    /* Mise à jour */
    utilisateur.password           = nouveauMotDePasse;
    utilisateur.mustChangePassword = false;
    utilisateur.activationToken    = undefined;
    utilisateur.activationTokenExp = undefined;
    utilisateur.isVerified         = true;
    await utilisateur.save();

    /* Connexion automatique après le changement */
    const jwtToken = genererToken(utilisateur._id);
    setCookieToken(res, jwtToken);

    return res.status(200).json({
      success: true,
      message: 'Mot de passe changé avec succès. Vous êtes maintenant connecté.',
      data: {
        token: jwtToken,
        user: {
          id:       utilisateur._id,
          fullName: utilisateur.fullName,
          email:    utilisateur.email,
          role:     utilisateur.role,
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur changerMotDePasseInitial:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PUT /api/livreur/profil
   Complétion du profil livreur — requiert d'être connecté (protect).
───────────────────────────────────────────────────────────────────────────── */
export const completerProfil = async (req, res) => {
  try {
    const {
      telephone,
      typeVehicule,
      numeroplaque,
      villeService,
      zonelivraison,
    } = req.body;

    /* Validation des champs obligatoires */
    const champsManquants = [];
    if (!telephone?.trim())    champsManquants.push('telephone');
    if (!typeVehicule?.trim()) champsManquants.push('typeVehicule');
    if (!villeService?.trim()) champsManquants.push('villeService');
    if (!zonelivraison?.trim()) champsManquants.push('zonelivraison');

    if (champsManquants.length > 0) {
      return res.status(422).json({
        success: false,
        message: `Champs obligatoires manquants : ${champsManquants.join(', ')}.`,
        errors:  champsManquants.map((c) => ({ field: c, message: 'Ce champ est obligatoire.' })),
      });
    }

    if (!['moto', 'velo', 'voiture', 'camionnette', 'autre'].includes(typeVehicule)) {
      return res.status(422).json({
        success: false,
        message: 'Type de véhicule invalide.',
        errors: [{ field: 'typeVehicule', message: 'Valeur invalide.' }],
      });
    }

    /* Mise à jour du profil Livreur */
    const livreur = await Livreur.findOneAndUpdate(
      { utilisateur: req.user._id },
      {
        telephone:    telephone.trim(),
        typeVehicule,
        numeroplaque: numeroplaque?.trim().toUpperCase() || null,
        villeService:  villeService.trim(),
        zonelivraison: zonelivraison.trim(),
        statut:        'actif',
        profilComplete: true,
      },
      { new: true, runValidators: true }
    ).populate('utilisateur', 'fullName email phone').lean();

    if (!livreur) {
      return res.status(404).json({ success: false, message: 'Profil livreur introuvable.' });
    }

    /* Met à jour le téléphone sur l'utilisateur si vide */
    if (!req.user.phone) {
      await User.findByIdAndUpdate(req.user._id, { phone: telephone.trim() });
    }

    return res.status(200).json({
      success: true,
      message: 'Profil complété avec succès. Bienvenue sur ZANDOO !',
      data: { livreur },
    });
  } catch (erreur) {
    console.error('Erreur completerProfil:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/livreur/profil
   Récupère le profil du livreur connecté.
───────────────────────────────────────────────────────────────────────────── */
export const getMonProfil = async (req, res) => {
  try {
    const livreur = await Livreur.findOne({ utilisateur: req.user._id })
      .populate('utilisateur', 'fullName email phone avatar isVerified')
      .lean();

    if (!livreur) {
      return res.status(404).json({ success: false, message: 'Profil livreur introuvable.' });
    }

    return res.status(200).json({ success: true, data: { livreur } });
  } catch (erreur) {
    console.error('Erreur getMonProfil:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
