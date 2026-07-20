import { body, param, query } from 'express-validator';

const TYPES_VALIDES       = ['banniere', 'mise_en_avant_produit', 'mise_en_avant_vendeur'];
const EMPLACEMENTS_VALIDES = ['accueil_haut', 'accueil_milieu', 'sidebar', 'page_categorie', 'page_produit'];
const STATUTS_VALIDES     = ['brouillon', 'active', 'pausee', 'expiree'];

export const validerIdPublicite = [
  param('id').isMongoId().withMessage("Identifiant invalide."),
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
  body('lienCible').optional().isString().trim(),
  body('texteAlt').optional().isString().trim().isLength({ max: 200 }),
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
  body('ordre').optional().isInt({ min: 0 }),
];

export const validerFiltresPublicites = [
  query('statut').optional().isIn(STATUTS_VALIDES),
  query('type').optional().isIn(TYPES_VALIDES),
  query('emplacement').optional().isIn(EMPLACEMENTS_VALIDES),
  query('page').optional().isInt({ min: 1 }),
  query('limite').optional().isInt({ min: 1, max: 100 }),
];
