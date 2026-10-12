import { Router } from 'express';
import { protect } from '../../middlewares/authentification.js';
import {
  getMesFavoris,
  getIdsFavoris,
  ajouterFavori,
  retirerFavori,
} from '../../controllers/acheteur/FavoriControleur.js';

const routeur = Router();

routeur.use(protect);

/* /api/acheteur/favoris */
routeur.get('/',              getMesFavoris);
routeur.get('/ids',           getIdsFavoris);
routeur.put('/:produitId',    ajouterFavori);
routeur.delete('/:produitId', retirerFavori);

export default routeur;
