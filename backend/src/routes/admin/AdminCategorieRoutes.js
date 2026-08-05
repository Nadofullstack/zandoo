import { Router } from 'express';
import {
  getCategories,
  getCategoriesPlates,
  getCategorieParId,
} from '../../controllers/admin/AdminCategorieControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';

const routeur = Router();

routeur.use(protect, requireRole('admin'));

/* Lecture uniquement — la gestion des catégories appartient aux vendeurs */
routeur.get('/liste-plate', getCategoriesPlates);
routeur.get('/',            getCategories);
routeur.get('/:id',         getCategorieParId);

export default routeur;
