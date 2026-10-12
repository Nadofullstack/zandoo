import { Router } from 'express';
import { protect, requireRole } from '../../middlewares/authentification.js';
import { getAvis, modifierStatutAvis } from '../../controllers/admin/AdminAvisControleur.js';

const routeur = Router();

routeur.use(protect, requireRole('admin'));

/* /api/admin/avis — modération des avis clients */
routeur.get('/',              getAvis);
routeur.patch('/:id/statut',  modifierStatutAvis);

export default routeur;
