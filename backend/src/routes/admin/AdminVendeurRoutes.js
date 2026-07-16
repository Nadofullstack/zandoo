import { Router } from 'express';
import {
  getStatistiquesVendeurs,
  getVendeurs,
  getVendeurParId,
  modifierStatutVendeur,
  modifierNotesAdmin,
} from '../../controllers/admin/AdminVendeurControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';

const routeur = Router();

/* Toutes les routes admin nécessitent un token valide + rôle admin */
routeur.use(protect, requireRole('admin'));

/* GET  /api/admin/vendeurs/statistiques — compteurs par statut */
routeur.get('/statistiques', getStatistiquesVendeurs);

/* GET  /api/admin/vendeurs              — liste paginée + filtres */
routeur.get('/', getVendeurs);

/* GET  /api/admin/vendeurs/:id          — profil complet d'un vendeur */
routeur.get('/:id', getVendeurParId);

/* PATCH /api/admin/vendeurs/:id/statut  — approuver / suspendre */
routeur.patch('/:id/statut', modifierStatutVendeur);

/* PATCH /api/admin/vendeurs/:id/notes   — notes internes admin */
routeur.patch('/:id/notes', modifierNotesAdmin);

export default routeur;
