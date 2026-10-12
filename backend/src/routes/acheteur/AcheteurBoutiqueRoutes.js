import { Router } from 'express';
import {
  getBoutiques,
  getBoutique,
  getProduitsBoutique,
  getAvisBoutiquePublic,
} from '../../controllers/acheteur/BoutiqueControleur.js';

const routeur = Router();

/* /api/acheteur/boutiques — pages publiques des boutiques (aucune authentification) */
routeur.get('/',               getBoutiques);
routeur.get('/:slug',          getBoutique);
routeur.get('/:slug/produits', getProduitsBoutique);
routeur.get('/:slug/avis',     getAvisBoutiquePublic);

export default routeur;
