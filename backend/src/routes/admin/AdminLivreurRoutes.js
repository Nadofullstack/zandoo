import { Router } from 'express';
import {
  getStatistiquesLivreurs,
  getLivreurs,
  getLivreurParId,
  supprimerLivreur,
} from '../../controllers/admin/AdminLivreurControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';

const routeur = Router();

/* Toutes les routes nécessitent un token valide + rôle admin */
routeur.use(protect, requireRole('admin'));

/* GET    /api/admin/livreurs/statistiques  — KPI globaux */
routeur.get('/statistiques', getStatistiquesLivreurs);

/* GET    /api/admin/livreurs               — liste paginée + filtres */
routeur.get('/', getLivreurs);

/* GET    /api/admin/livreurs/:id           — profil complet (lecture seule) */
routeur.get('/:id', getLivreurParId);

/* DELETE /api/admin/livreurs/:id           — suppression définitive */
routeur.delete('/:id', supprimerLivreur);

export default routeur;
