import { body, param, query } from 'express-validator';

/* ── Validation de l'ID MongoDB ──────────────────────────────────────── */
export const validerIdCommande = [
  param('id')
    .isMongoId()
    .withMessage("L'identifiant de la commande est invalide."),
];

/* ── Validation du changement de statut ──────────────────────────────── */
export const validerChangementStatut = [
  param('id')
    .isMongoId()
    .withMessage("L'identifiant de la commande est invalide."),
  body('statut')
    .isIn(['en_attente', 'payee', 'expediee', 'livree', 'annulee'])
    .withMessage('Statut invalide. Valeurs acceptées : en_attente, payee, expediee, livree, annulee.'),
  body('raison')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 300 })
    .withMessage('La raison ne peut pas dépasser 300 caractères.'),
];

/* ── Validation des notes admin ──────────────────────────────────────── */
export const validerNotesAdmin = [
  param('id')
    .isMongoId()
    .withMessage("L'identifiant de la commande est invalide."),
  body('notesAdmin')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Les notes ne peuvent pas dépasser 500 caractères.'),
];

/* ── Validation des filtres de liste ─────────────────────────────────── */
export const validerFiltresCommandes = [
  query('statut')
    .optional()
    .isIn(['en_attente', 'payee', 'expediee', 'livree', 'annulee'])
    .withMessage('Statut invalide.'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif.'),
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100.'),
];
