import { Router } from 'express';
import {
  getCategories,
  getCategoriesPlates,
  getCategorieParId,
  creerCategorie,
  modifierCategorie,
  supprimerCategorie,
} from '../../controllers/admin/AdminCategorieControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';

const routeur = Router();

routeur.use(protect, requireRole('admin'));

routeur.get('/liste-plate', getCategoriesPlates);
routeur.get('/',            getCategories);
routeur.get('/:id',         getCategorieParId);
routeur.post('/',           creerCategorie);
routeur.put('/:id',         modifierCategorie);
routeur.delete('/:id',      supprimerCategorie);

export default routeur;
