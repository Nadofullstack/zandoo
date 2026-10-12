import { body, param } from 'express-validator';

/** Champs d'une adresse de livraison (création : requis ; modification : optionnels). */
const champsAdresse = (optionnel) => {
  const requis = (champ, message) => (optionnel ? body(champ).optional() : body(champ).notEmpty().withMessage(message));

  return [
    requis('nomComplet', 'Le nom du destinataire est requis.')
      .isString().trim().isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères.'),
    requis('telephone', 'Le téléphone est requis.')
      .isString().trim()
      .matches(/^\+?[0-9\s.-]{8,20}$/).withMessage('Numéro de téléphone invalide.'),
    requis('ville', 'La ville est requise.')
      .isString().trim().isLength({ max: 100 }),
    body('libelle').optional().isString().trim().isLength({ max: 40 }),
    body('quartier').optional().isString().trim().isLength({ max: 100 }),
    body('rue').optional().isString().trim().isLength({ max: 200 }),
    body('pays').optional().isString().trim().isLength({ max: 100 }),
    body('instructions').optional().isString().trim().isLength({ max: 300 }),
    body('parDefaut').optional().isBoolean().toBoolean(),
  ];
};

const idAdresse = param('id').isMongoId().withMessage("Identifiant d'adresse invalide.");

export const validerCreationAdresse     = champsAdresse(false);
export const validerModificationAdresse = [idAdresse, ...champsAdresse(true)];
export const validerIdAdresse           = [idAdresse];
