import { Router } from 'express';
import {
  getStatistiquesProduits,
  getProduits,
  getProduitParId,
  modifierStatutProduit,
  supprimerProduit,
} from '../../controllers/admin/AdminProduitControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';

const routeur = Router();

routeur.use(protect, requireRole('admin'));

/* Lecture */
routeur.get('/statistiques',    getStatistiquesProduits);
routeur.get('/',                getProduits);
routeur.get('/:id',             getProduitParId);

/* Modération */
routeur.patch('/:id/statut',    modifierStatutProduit);
routeur.delete('/:id',          supprimerProduit);

export default routeur;
