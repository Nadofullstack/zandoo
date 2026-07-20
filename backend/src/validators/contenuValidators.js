import { body, param, query } from 'express-validator';

/* ── Pages statiques ─────────────────────────────────────────────────── */
export const validerIdPage = [
  param('id').isMongoId().withMessage('Identifiant invalide.'),
];

export const validerCreerPage = [
  body('slug')
    .notEmpty().withMessage('Le slug est requis.')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug invalide (lettres minuscules, chiffres, tirets).'),
  body('titre')
    .notEmpty().withMessage('Le titre est requis.')
    .isString().trim().isLength({ max: 200 }),
  body('contenu')
    .notEmpty().withMessage('Le contenu est requis.'),
  body('metaTitre').optional().isString().trim().isLength({ max: 70 }),
  body('metaDescription').optional().isString().trim().isLength({ max: 160 }),
  body('publiee').optional().isBoolean(),
  body('ordre').optional().isInt({ min: 0 }),
];

export const validerModifierPage = [
  param('id').isMongoId().withMessage('Identifiant invalide.'),
  body('titre').optional().isString().trim().isLength({ max: 200 }),
  body('contenu').optional().isString(),
  body('metaTitre').optional().isString().trim().isLength({ max: 70 }),
  body('metaDescription').optional().isString().trim().isLength({ max: 160 }),
  body('publiee').optional().isBoolean(),
  body('ordre').optional().isInt({ min: 0 }),
];

/* ── Articles blog ───────────────────────────────────────────────────── */
export const validerIdArticle = [
  param('id').isMongoId().withMessage('Identifiant invalide.'),
];

export const validerCreerArticle = [
  body('titre')
    .notEmpty().withMessage('Le titre est requis.')
    .isString().trim().isLength({ max: 200 }),
  body('contenu')
    .notEmpty().withMessage('Le contenu est requis.'),
  body('resume').optional().isString().trim().isLength({ max: 500 }),
  body('categorieEditoriale')
    .optional()
    .isIn(['actualite', 'conseil', 'mise_a_jour', 'autre']),
  body('statut').optional().isIn(['brouillon', 'publie', 'archive']),
  body('tags').optional().isArray(),
  body('imageCouverture').optional().isURL(),
  body('publieAt').optional().isISO8601(),
  body('metaTitre').optional().isString().trim().isLength({ max: 70 }),
  body('metaDescription').optional().isString().trim().isLength({ max: 160 }),
];

export const validerModifierArticle = [
  param('id').isMongoId().withMessage('Identifiant invalide.'),
  body('titre').optional().isString().trim().isLength({ max: 200 }),
  body('contenu').optional().isString(),
  body('resume').optional().isString().trim().isLength({ max: 500 }),
  body('categorieEditoriale').optional().isIn(['actualite', 'conseil', 'mise_a_jour', 'autre']),
  body('statut').optional().isIn(['brouillon', 'publie', 'archive']),
  body('tags').optional().isArray(),
  body('imageCouverture').optional({ nullable: true }),
  body('publieAt').optional({ nullable: true }).isISO8601(),
  body('metaTitre').optional().isString().trim().isLength({ max: 70 }),
  body('metaDescription').optional().isString().trim().isLength({ max: 160 }),
];

export const validerFiltresArticles = [
  query('statut').optional().isIn(['brouillon', 'publie', 'archive']),
  query('categorieEditoriale').optional().isIn(['actualite', 'conseil', 'mise_a_jour', 'autre']),
  query('page').optional().isInt({ min: 1 }),
  query('limite').optional().isInt({ min: 1, max: 100 }),
];
