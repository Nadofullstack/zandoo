import { Router } from 'express';
import { validationResult } from 'express-validator';
import { protect } from '../../middlewares/authentification.js';
import {
  getMesAdresses,
  ajouterAdresse,
  modifierAdresse,
  definirAdresseParDefaut,
  supprimerAdresse,
} from '../../controllers/acheteur/AdresseControleur.js';
import {
  validerCreationAdresse,
  validerModificationAdresse,
  validerIdAdresse,
} from '../../validators/adresseValidators.js';

const routeur = Router();

routeur.use(protect);

const gererErreurs = (req, res, next) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    return res.status(422).json({ success: false, message: erreurs.array()[0].msg, errors: erreurs.array() });
  }
  next();
};

/* /api/acheteur/adresses — carnet d'adresses de livraison */
routeur.get('/',                    getMesAdresses);
routeur.post('/',                   validerCreationAdresse,     gererErreurs, ajouterAdresse);
routeur.put('/:id',                 validerModificationAdresse, gererErreurs, modifierAdresse);
routeur.patch('/:id/par-defaut',    validerIdAdresse,           gererErreurs, definirAdresseParDefaut);
routeur.delete('/:id',              validerIdAdresse,           gererErreurs, supprimerAdresse);

export default routeur;
