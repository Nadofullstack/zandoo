import { Router } from 'express';
import {
  getPages, getPageParId, creerPage, modifierPage, supprimerPage,
} from '../../controllers/admin/AdminPageStatiqueControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';
import {
  validerIdPage, validerCreerPage, validerModifierPage,
} from '../../validators/contenuValidators.js';

const routeur = Router();
routeur.use(protect, requireRole('admin'));

routeur.get('/',    getPages);
routeur.get('/:id', validerIdPage,        getPageParId);
routeur.post('/',   validerCreerPage,     creerPage);
routeur.put('/:id', validerModifierPage,  modifierPage);
routeur.delete('/:id', validerIdPage,     supprimerPage);

export default routeur;
