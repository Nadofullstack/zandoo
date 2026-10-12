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
 *
 * Note : un utilisateur avec estVendeur = true est considéré comme ayant
 * le rôle 'vendeur' en plus de son rôle principal (acheteur).
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit. Privilèges insuffisants.',
      });
    }

    // Un utilisateur avec estVendeur = true peut accéder aux routes vendeur
    const roleEffectif = req.user.role;
    const estVendeur   = req.user.estVendeur === true;

    const aAcces =
      roles.includes(roleEffectif) ||
      (roles.includes('vendeur') && estVendeur);

    if (!aAcces) {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit. Privilèges insuffisants.',
      });
    }

    next();
  };
};
