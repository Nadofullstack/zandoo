import { body, param, query } from 'express-validator';

/* ── Validation de l'ID MongoDB ──────────────────────────────────────── */
export const validerIdCommande = [
  param('id')
    .isMongoId()
    .withMessage("L'identifiant de la commande est invalide."),
];

/* ── Validation du changement de statut (admin) ──────────────────────── */
export const validerChangementStatut = [
  param('id')
    .isMongoId()
    .withMessage("L'identifiant de la commande est invalide."),
  body('statut')
    .isIn(['en_attente', 'payee', 'en_preparation', 'expediee', 'livree', 'annulee', 'remboursee'])
    .withMessage('Statut invalide.'),
  body('raison')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 300 })
    .withMessage('La raison ne peut pas dépasser 300 caractères.'),
];

/* ── Validation du changement de statut (vendeur) ────────────────────── */
export const validerChangementStatutVendeur = [
  param('id')
    .isMongoId()
    .withMessage("L'identifiant de la commande est invalide."),
  body('statut')
    .isIn(['en_preparation', 'expediee'])
    .withMessage('Statut non autorisé. Valeurs acceptées : en_preparation, expediee.'),
  body('notesVendeur')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Les notes ne peuvent pas dépasser 500 caractères.'),
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

/* ── Validation de l'assignation d'un livreur ───────────────────────── */
export const validerAssignationLivreur = [
  param('id')
    .isMongoId()
    .withMessage("L'identifiant de la commande est invalide."),
  body('livreurId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("L'identifiant du livreur est invalide."),
];

/* ── Validation des filtres de liste (admin) ─────────────────────────── */
export const validerFiltresCommandes = [
  query('statut')
    .optional()
    .isIn(['en_attente', 'payee', 'en_preparation', 'expediee', 'livree', 'annulee', 'remboursee'])
    .withMessage('Statut invalide.'),
  query('vendeur')
    .optional()
    .isMongoId()
    .withMessage("L'identifiant vendeur est invalide."),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif.'),
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100.'),
];

/* ── Validation des filtres de liste (vendeur) ───────────────────────── */
export const validerFiltresCommandesVendeur = [
  query('statut')
    .optional()
    .isIn(['en_attente', 'payee', 'en_preparation', 'expediee', 'livree', 'annulee', 'remboursee'])
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
