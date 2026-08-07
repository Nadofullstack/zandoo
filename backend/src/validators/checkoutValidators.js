import { body, param, query } from 'express-validator';

/* ── Checkout ─────────────────────────────────────────────────────────────── */
export const validerCheckout = [
  body('adresseLivraison.nomComplet')
    .notEmpty().withMessage('Le nom complet est requis.')
    .isString().trim()
    .isLength({ max: 100 }).withMessage('Le nom ne peut pas dépasser 100 caractères.'),

  body('adresseLivraison.ville')
    .notEmpty().withMessage('La ville est requise.')
    .isString().trim()
    .isLength({ max: 100 }).withMessage('La ville ne peut pas dépasser 100 caractères.'),

  body('adresseLivraison.telephone')
    .optional()
    .isString().trim()
    .isLength({ max: 30 }),

  body('adresseLivraison.rue')
    .optional()
    .isString().trim()
    .isLength({ max: 200 }),

  body('adresseLivraison.pays')
    .optional()
    .isString().trim()
    .isLength({ max: 100 }),

  body('adresseLivraison.instructions')
    .optional()
    .isString().trim()
    .isLength({ max: 300 }),

  body('paiement.methode')
    .isIn(['mobile_money', 'carte_bancaire', 'virement', 'especes', 'autre'])
    .withMessage('Méthode de paiement invalide.'),

  body('notesClient')
    .optional()
    .isString().trim()
    .isLength({ max: 500 }),
];

/* ── Commandes acheteur ───────────────────────────────────────────────────── */
export const validerFiltresCommandesAcheteur = [
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
    .isInt({ min: 1, max: 50 })
    .withMessage('La limite doit être entre 1 et 50.'),
];

export const validerIdCommandeAcheteur = [
  param('id')
    .isMongoId()
    .withMessage("L'identifiant de la commande est invalide."),
];

export const validerGroupeCommandeId = [
  param('groupeCommandeId')
    .isUUID()
    .withMessage("L'identifiant de groupe est invalide."),
];
