import { Router } from 'express';
import {
  getStatistiquesLivreurs,
  creerLivreur,
  getLivreurs,
  getLivreurParId,
  modifierStatutLivreur,
  modifierNotesAdmin,
  renvoyerInvitation,
  supprimerLivreur,
} from '../../controllers/admin/AdminLivreurControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';

const routeur = Router();

/* Toutes les routes nécessitent un token valide + rôle admin */
routeur.use(protect, requireRole('admin'));

/* GET  /api/admin/livreurs/statistiques */
routeur.get('/statistiques', getStatistiquesLivreurs);

/* GET  /api/admin/livreurs              — liste paginée + filtres */
routeur.get('/', getLivreurs);

/* POST /api/admin/livreurs              — créer un livreur */
routeur.post('/', creerLivreur);

/* GET  /api/admin/livreurs/:id          — profil complet */
routeur.get('/:id', getLivreurParId);

/* PATCH /api/admin/livreurs/:id/statut  — activer / suspendre */
routeur.patch('/:id/statut', modifierStatutLivreur);

/* PATCH /api/admin/livreurs/:id/notes   — notes internes admin */
routeur.patch('/:id/notes', modifierNotesAdmin);

/* POST  /api/admin/livreurs/:id/renvoyer-invitation */
routeur.post('/:id/renvoyer-invitation', renvoyerInvitation);

/* DELETE /api/admin/livreurs/:id */
routeur.delete('/:id', supprimerLivreur);

export default routeur;
