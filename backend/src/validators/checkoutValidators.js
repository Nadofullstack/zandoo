import { body, param, query } from 'express-validator';

/* ── Checkout ─────────────────────────────────────────────────────────────── */

/** Adresse saisie : requise uniquement si aucune adresse enregistrée (adresseId) n'est fournie */
const sansAdresseEnregistree = body('adresseId').not().exists();

export const validerCheckout = [
  body('adresseId')
    .optional()
    .isMongoId().withMessage("Identifiant d'adresse invalide."),

  body('adresseLivraison.nomComplet')
    .if(sansAdresseEnregistree)
    .notEmpty().withMessage('Le nom complet est requis.')
    .isString().trim()
    .isLength({ max: 100 }).withMessage('Le nom ne peut pas dépasser 100 caractères.'),

  body('adresseLivraison.ville')
    .if(sansAdresseEnregistree)
    .notEmpty().withMessage('La ville est requise.')
    .isString().trim()
    .isLength({ max: 100 }).withMessage('La ville ne peut pas dépasser 100 caractères.'),

  body('adresseLivraison.telephone')
    .optional()
    .isString().trim()
    .isLength({ max: 30 }),

  body('adresseLivraison.quartier')
    .optional()
    .isString().trim()
    .isLength({ max: 100 }),

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

  body('livraisons')
    .optional()
    .isObject().withMessage('Choix de livraison invalide.')
    .custom((livraisons) => Object.values(livraisons).every((m) => ['domicile', 'retrait'].includes(m)))
    .withMessage('Mode de livraison invalide (domicile ou retrait).'),

  body('paiement.methode')
    .isIn(['mobile_money', 'carte_bancaire', 'virement', 'especes', 'autre'])
    .withMessage('Méthode de paiement invalide.'),

  body('notesClient')
    .optional()
    .isString().trim()
    .isLength({ max: 500 }),
];

export const validerOptionsLivraison = [
  body('ville')
    .notEmpty().withMessage('La ville est requise pour calculer la livraison.')
    .isString().trim()
    .isLength({ max: 100 }),
];

/* ── Commandes acheteur ───────────────────────────────────────────────────── */
export const validerFiltresCommandesAcheteur = [
  query('statut')
    .optional()
    .isIn(['en_attente', 'payee', 'en_preparation', 'expediee', 'livree', 'annulee', 'remboursee'])
    .withMessage('Statut invalide.'),
  query('groupe')
    .optional()
    .isIn(['en_cours', 'livree', 'annulee'])
    .withMessage('Groupe de statut invalide.'),
  query('recherche')
    .optional()
    .isString().trim()
    .isLength({ max: 100 }).withMessage('Recherche trop longue.'),
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

export const validerAnnulationAcheteur = [
  ...validerIdCommandeAcheteur,
  body('raison')
    .optional()
    .isString().trim()
    .isLength({ max: 300 }).withMessage('La raison ne peut pas dépasser 300 caractères.'),
];

export const validerGroupeCommandeId = [
  param('groupeCommandeId')
    .isUUID()
    .withMessage("L'identifiant de groupe est invalide."),
];
