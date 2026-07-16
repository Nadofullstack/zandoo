import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../../models/User.js';

/* Client Google pour vérifier les tokens envoyés depuis le frontend */
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Génère un token JWT signé pour un utilisateur.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Définit le cookie httpOnly contenant le token JWT.
 */
const setCookieToken = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  });
};

/**
 * POST /api/auth/google
 * Authentifie ou crée un compte via Google OAuth.
 * Reçoit le credential (id_token) renvoyé par @react-oauth/google côté frontend.
 */
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Token Google manquant.',
      });
    }

    /* Vérification du token auprès des serveurs Google */
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    /* Recherche d'un compte existant par e-mail */
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      /* Création automatique d'un compte acheteur sans mot de passe */
      user = await User.create({
        fullName: name,
        email: email.toLowerCase(),
        phone: '',           // non fourni par Google
        password: googleId,  // valeur factice — la connexion se fait via Google
        googleId,
        avatar: picture,
      });
    }

    const token = generateToken(user._id);
    setCookieToken(res, token);

    return res.status(200).json({
      success: true,
      message: 'Connexion Google réussie.',
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Erreur googleLogin:', error);
    return res.status(401).json({
      success: false,
      message: 'Token Google invalide ou expiré.',
    });
  }
};

/**
 * POST /api/auth/login
 * Authentifie un utilisateur existant avec son e-mail ou son téléphone et son mot de passe.
 */
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Recherche par e-mail ou par téléphone selon le format de l'identifiant
    const query = identifier.includes('@')
      ? { email: identifier.toLowerCase() }
      : { phone: identifier };

    // On sélectionne explicitement le mot de passe (champ caché par défaut)
    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.',
        errors: [{ field: 'identifier', message: 'Aucun compte trouvé avec ces identifiants.' }],
      });
    }

    // Vérification du mot de passe via la méthode du modèle
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.',
        errors: [{ field: 'password', message: 'Mot de passe incorrect.' }],
      });
    }

    const token = generateToken(user._id);
    setCookieToken(res, token);

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Erreur login:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur. Veuillez réessayer.',
    });
  }
};

/**
 * POST /api/auth/register
 * Crée un nouveau compte acheteur.
 */
export const register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Vérification qu'aucun compte n'existe déjà avec cet e-mail
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Un compte avec cette adresse e-mail existe déjà.',
        errors: [{ field: 'email', message: 'Adresse e-mail déjà utilisée.' }],
      });
    }

    // Création de l'utilisateur (le mot de passe est haché dans le hook pre-save du modèle)
    const user = await User.create({ fullName, email, phone, password });

    const token = generateToken(user._id);
    setCookieToken(res, token);

    return res.status(201).json({
      success: true,
      message: 'Compte créé avec succès.',
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Erreur register:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur. Veuillez réessayer.',
    });
  }
};
