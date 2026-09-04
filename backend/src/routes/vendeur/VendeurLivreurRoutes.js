import { Router } from 'express';
import {
  getStatistiquesLivreurs,
  getMesLivreurs,
  creerLivreur,
  getLivreurParId,
  modifierStatutLivreur,
  renvoyerInvitation,
  supprimerLivreur,
} from '../../controllers/vendeur/VendeurLivreurControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';

const routeur = Router();

/* Toutes les routes nécessitent un token valide + rôle vendeur */
routeur.use(protect, requireRole('vendeur'));

/* GET  /api/vendeur/livreurs/statistiques */
routeur.get('/statistiques', getStatistiquesLivreurs);

/* GET  /api/vendeur/livreurs              — liste paginée + filtres */
routeur.get('/', getMesLivreurs);

/* POST /api/vendeur/livreurs              — créer un livreur */
routeur.post('/', creerLivreur);

/* GET  /api/vendeur/livreurs/:id          — profil complet */
routeur.get('/:id', getLivreurParId);

/* PATCH /api/vendeur/livreurs/:id/statut  — activer / suspendre */
routeur.patch('/:id/statut', modifierStatutLivreur);

/* POST  /api/vendeur/livreurs/:id/renvoyer-invitation */
routeur.post('/:id/renvoyer-invitation', renvoyerInvitation);

/* DELETE /api/vendeur/livreurs/:id */
routeur.delete('/:id', supprimerLivreur);

export default routeur;
