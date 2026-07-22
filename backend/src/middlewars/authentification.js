import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';

/**
 * Middleware protect — vérifie le JWT dans le cookie httpOnly.
 * Attache l'utilisateur complet à req.user.
 */
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Authentification requise.',
      });
    }

    const decoded = jwt.verify(token, env.jwt.secret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur introuvable. Veuillez vous reconnecter.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Compte suspendu. Contactez le support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré. Veuillez vous reconnecter.',
    });
  }
};

/**
 * Middleware requireRole — vérifie que l'utilisateur a le rôle requis.
 * Doit être appelé après protect.
 * @param {...string} roles - Rôles autorisés
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit. Privilèges insuffisants.',
      });
    }
    next();
  };
};
