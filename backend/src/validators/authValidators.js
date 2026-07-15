import { body } from 'express-validator';

export const loginValidators = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage("L'e-mail ou le téléphone est requis"),

  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),
];

export const registerValidators = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Le nom complet est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage("L'adresse e-mail est requise")
    .isEmail()
    .withMessage('Adresse e-mail invalide')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Le numéro de téléphone est requis')
    /* Accepte le format E.164 (+22997000000) ou les formats locaux */
    .matches(/^\+?[0-9\s\-().]{7,25}$/)
    .withMessage('Numéro de téléphone invalide'),

  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
];
