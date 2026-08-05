import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../../models/User.js';
import env from '../../config/env.js';

/* Client Google pour vérifier les tokens envoyés depuis le frontend */
const googleClient = new OAuth2Client(env.google.clientId);

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
};

const setCookieToken = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure:   env.server.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });
};

/** Construit l'objet user à retourner dans les réponses auth */
const buildUserPayload = (user) => ({
  id:         user._id,
  fullName:   user.fullName,
  email:      user.email,
  phone:      user.phone,
  role:       user.role,
  estVendeur: user.estVendeur ?? false,
});

/**
 * POST /api/auth/google
 * Authentifie ou crée un compte via Google OAuth.
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

    const ticket = await googleClient.verifyIdToken({
      idToken:  credential,
      audience: env.google.clientId,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        fullName: name,
        email:    email.toLowerCase(),
        phone:    '',
        password: googleId,
        googleId,
        avatar:   picture,
      });
    }

    const token = generateToken(user._id);
    setCookieToken(res, token);

    return res.status(200).json({
      success: true,
      message: 'Connexion Google réussie.',
      data:    { token, user: buildUserPayload(user) },
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

    const query = identifier.includes('@')
      ? { email: identifier.toLowerCase() }
      : { phone: identifier };

    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.',
        errors: [{ field: 'identifier', message: 'Aucun compte trouvé avec ces identifiants.' }],
      });
    }

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
      data:    { token, user: buildUserPayload(user) },
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
 * POST /api/auth/logout
 * Déconnecte l'utilisateur en vidant le cookie JWT httpOnly.
 */
export const logout = async (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure:   env.server.nodeEnv === 'production',
    sameSite: 'strict',
  });
  return res.status(200).json({ success: true, message: 'Déconnexion réussie.' });
};

/**
 * POST /api/auth/register
 * Crée un nouveau compte acheteur.
 */
export const register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Un compte avec cette adresse e-mail existe déjà.',
        errors: [{ field: 'email', message: 'Adresse e-mail déjà utilisée.' }],
      });
    }

    const user = await User.create({ fullName, email, phone, password });

    const token = generateToken(user._id);
    setCookieToken(res, token);

    return res.status(201).json({
      success: true,
      message: 'Compte créé avec succès.',
      data:    { token, user: buildUserPayload(user) },
    });
  } catch (error) {
    console.error('Erreur register:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur. Veuillez réessayer.',
    });
  }
};

/**
 * GET /api/auth/me
 * Retourne le profil frais de l'utilisateur connecté depuis la base.
 * Permet de rafraîchir la session localStorage sans se reconnecter
 * (utile après approbation de boutique par l'admin).
 */
export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data:    { user: buildUserPayload(req.user) },
    });
  } catch (error) {
    console.error('Erreur getMe:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
