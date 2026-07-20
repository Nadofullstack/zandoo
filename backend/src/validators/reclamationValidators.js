import { body, param, query } from 'express-validator';

const STATUTS_VALIDES   = ['ouvert', 'en_cours', 'en_attente_reponse', 'resolu', 'ferme'];
const PRIORITES_VALIDES = ['basse', 'normale', 'haute', 'urgente'];
const CATEGORIES_VALIDES = [
  'produit_non_recu', 'produit_defectueux', 'produit_non_conforme',
  'remboursement', 'vendeur', 'paiement', 'compte', 'autre',
];

/* ── ID Mongo ─────────────────────────────────────────────────────────── */
export const validerIdReclamation = [
  param('id')
    .isMongoId()
    .withMessage("L'identifiant de la réclamation est invalide."),
];

/* ── Filtres liste ───────────────────────────────────────────────────── */
export const validerFiltresReclamations = [
  query('statut')
    .optional()
    .isIn(STATUTS_VALIDES)
    .withMessage('Statut invalide.'),
  query('priorite')
    .optional()
    .isIn(PRIORITES_VALIDES)
    .withMessage('Priorité invalide.'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif.'),
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100.'),
];

/* ── Changement de statut ────────────────────────────────────────────── */
export const validerChangementStatut = [
  param('id')
    .isMongoId()
    .withMessage("L'identifiant de la réclamation est invalide."),
  body('statut')
    .isIn(STATUTS_VALIDES)
    .withMessage('Statut invalide.'),
  body('raison')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 300 })
    .withMessage('La raison ne peut pas dépasser 300 caractères.'),
];

/* ── Ajout d'un message ──────────────────────────────────────────────── */
export const validerAjoutMessage = [
  param('id')
    .isMongoId()
    .withMessage("L'identifiant de la réclamation est invalide."),
  body('contenu')
    .notEmpty()
    .withMessage('Le contenu du message est requis.')
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Le message ne peut pas dépasser 2000 caractères.'),
];

/* ── Assignation ─────────────────────────────────────────────────────── */
export const validerAssignation = [
  param('id')
    .isMongoId()
    .withMessage("L'identifiant de la réclamation est invalide."),
  body('adminId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("L'identifiant de l'admin est invalide."),
];

/* ── Notes admin ─────────────────────────────────────────────────────── */
export const validerNotesAdmin = [
  param('id')
    .isMongoId()
    .withMessage("L'identifiant de la réclamation est invalide."),
  body('notesAdmin')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Les notes ne peuvent pas dépasser 500 caractères.'),
];

/* ── Priorité ────────────────────────────────────────────────────────── */
export const validerChangementPriorite = [
  param('id')
    .isMongoId()
    .withMessage("L'identifiant de la réclamation est invalide."),
  body('priorite')
    .isIn(PRIORITES_VALIDES)
    .withMessage('Priorité invalide. Valeurs : basse, normale, haute, urgente.'),
];
