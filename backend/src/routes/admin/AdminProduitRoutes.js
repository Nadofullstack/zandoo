import { Router } from 'express';
import {
  getStatistiquesProduits,
  getProduits,
  getProduitParId,
  creerProduit,
  modifierProduit,
  modifierStatutProduit,
  supprimerProduit,
} from '../../controllers/admin/AdminProduitControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';

const routeur = Router();

routeur.use(protect, requireRole('admin'));

routeur.get('/statistiques',    getStatistiquesProduits);
routeur.get('/',                getProduits);
routeur.get('/:id',             getProduitParId);
routeur.post('/',               creerProduit);
routeur.put('/:id',             modifierProduit);
routeur.patch('/:id/statut',    modifierStatutProduit);
routeur.delete('/:id',          supprimerProduit);

export default routeur;
