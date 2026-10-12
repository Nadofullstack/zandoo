import { Router } from 'express';
import {
  getProduits,
  getProduitParSlug,
  getCategories,
  getProduitsParCategorie,
  rechercherProduits,
} from '../../controllers/acheteur/CatalogueControleur.js';
import { getAvisProduit } from '../../controllers/acheteur/AvisControleur.js';
import { getPromotions } from '../../controllers/acheteur/AccueilControleur.js';

const routeur = Router();

/* Routes publiques — aucune authentification requise */
routeur.get('/',                              getProduits);
routeur.get('/recherche',                     rechercherProduits);
routeur.get('/categories',                    getCategories);
routeur.get('/categories/:slug/produits',     getProduitsParCategorie);
routeur.get('/promotions',                    getPromotions);   // avant /:slug
routeur.get('/:produitId/avis',               getAvisProduit);
routeur.get('/:slug',                         getProduitParSlug);

export default routeur;
