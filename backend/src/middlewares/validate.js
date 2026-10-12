import { validationResult } from 'express-validator';

/**
 * Middleware de validation des données entrantes.
 * Vérifie les erreurs remontées par express-validator.
 * Retourne une réponse 422 avec les messages structurés si la validation échoue.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Données invalides',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

export default validate;
