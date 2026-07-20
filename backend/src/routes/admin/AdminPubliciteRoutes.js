import { Router } from 'express';
import {
  getStatistiquesPublicites,
  getPublicites,
  getPubliciteParId,
  creerPublicite,
  modifierPublicite,
  supprimerPublicite,
} from '../../controllers/admin/AdminPubliciteControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';
import {
  validerIdPublicite,
  validerCreerPublicite,
  validerModifierPublicite,
  validerFiltresPublicites,
} from '../../validators/publiciteValidators.js';

const routeur = Router();
routeur.use(protect, requireRole('admin'));

/* GET  /api/admin/publicites/statistiques */
routeur.get('/statistiques', getStatistiquesPublicites);

/* GET  /api/admin/publicites */
routeur.get('/', validerFiltresPublicites, getPublicites);

/* GET  /api/admin/publicites/:id */
routeur.get('/:id', validerIdPublicite, getPubliciteParId);

/* POST /api/admin/publicites */
routeur.post('/', validerCreerPublicite, creerPublicite);

/* PUT  /api/admin/publicites/:id */
routeur.put('/:id', validerModifierPublicite, modifierPublicite);

/* DELETE /api/admin/publicites/:id */
routeur.delete('/:id', validerIdPublicite, supprimerPublicite);

export default routeur;
