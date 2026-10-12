import { body, param, query } from 'express-validator';

const TYPES_VALIDES       = ['banniere', 'mise_en_avant_produit', 'mise_en_avant_vendeur'];
const EMPLACEMENTS_VALIDES = ['accueil_haut', 'accueil_milieu', 'sidebar', 'page_categorie', 'page_produit'];
const STATUTS_VALIDES     = ['brouillon', 'active', 'pausee', 'expiree'];

export const validerIdPublicite = [
  param('id').isMongoId().withMessage("Identifiant invalide."),
];

/** Contenu affiché à l'acheteur — commun à la création et à la modification */
const validateursContenu = [
  body('lienCible').optional().isString().trim()
    .custom((v) => v === '' || /^\/(?!\/)/.test(v) || /^https?:\/\//i.test(v))
    .withMessage('Le lien doit être une page du site (/catalogue…) ou une adresse http(s).'),
  body('texteAlt').optional().isString().trim().isLength({ max: 200 }),
  body('accroche').optional().isString().trim().isLength({ max: 80 }).withMessage("L'accroche ne peut pas dépasser 80 caractères."),
  body('description').optional().isString().trim().isLength({ max: 160 }).withMessage('La description ne peut pas dépasser 160 caractères.'),
  body('libelleBouton').optional().isString().trim().isLength({ max: 30 }).withMessage('Le libellé du bouton ne peut pas dépasser 30 caractères.'),
];

export const validerCreerPublicite = [
  body('titre')
    .notEmpty().withMessage('Le titre est requis.')
    .isString().trim().isLength({ max: 150 }),
  body('type')
    .isIn(TYPES_VALIDES).withMessage('Type invalide.'),
  body('emplacement')
    .isIn(EMPLACEMENTS_VALIDES).withMessage('Emplacement invalide.'),
  body('dateDebut')
    .notEmpty().withMessage('La date de début est requise.')
    .isISO8601().withMessage('Date de début invalide.'),
  body('dateFin')
    .notEmpty().withMessage('La date de fin est requise.')
    .isISO8601().withMessage('Date de fin invalide.'),
  body('imageUrl').optional().isURL().withMessage("L'URL de l'image est invalide."),
  ...validateursContenu,
  body('ordre').optional().isInt({ min: 0 }),
];

export const validerModifierPublicite = [
  param('id').isMongoId().withMessage("Identifiant invalide."),
  body('titre').optional().isString().trim().isLength({ max: 150 }),
  body('type').optional().isIn(TYPES_VALIDES),
  body('emplacement').optional().isIn(EMPLACEMENTS_VALIDES),
  body('statut').optional().isIn(STATUTS_VALIDES),
  body('dateDebut').optional().isISO8601(),
  body('dateFin').optional().isISO8601(),
  body('imageUrl').optional().isURL(),
  ...validateursContenu,
  body('ordre').optional().isInt({ min: 0 }),
];

export const validerFiltresPublicites = [
  query('statut').optional().isIn(STATUTS_VALIDES),
  query('type').optional().isIn(TYPES_VALIDES),
  query('emplacement').optional().isIn(EMPLACEMENTS_VALIDES),
  query('page').optional().isInt({ min: 1 }),
  query('limite').optional().isInt({ min: 1, max: 100 }),
];
