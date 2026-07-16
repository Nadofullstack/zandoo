import { Router } from 'express';
import {
  getStatistiquesUtilisateurs,
  getUtilisateurs,
  getUtilisateurParId,
  modifierUtilisateur,
  modifierStatutUtilisateur,
  supprimerUtilisateur,
} from '../../controllers/admin/AdminUtilisateurControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';

const routeur = Router();

/* Toutes les routes nécessitent un token valide + rôle admin */
routeur.use(protect, requireRole('admin'));

routeur.get('/statistiques',        getStatistiquesUtilisateurs);
routeur.get('/',                    getUtilisateurs);
routeur.get('/:id',                 getUtilisateurParId);
routeur.put('/:id',                 modifierUtilisateur);
routeur.patch('/:id/statut',        modifierStatutUtilisateur);
routeur.delete('/:id',              supprimerUtilisateur);

export default routeur;
