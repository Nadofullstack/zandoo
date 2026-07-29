import { Router } from 'express';
import {
  getProduits,
  getProduitParSlug,
  getCategories,
  getProduitsParCategorie,
  rechercherProduits,
} from '../../controllers/acheteur/CatalogueControleur.js';

const routeur = Router();

/* Routes publiques — aucune authentification requise */
routeur.get('/',                              getProduits);
routeur.get('/recherche',                     rechercherProduits);
routeur.get('/categories',                    getCategories);
routeur.get('/categories/:slug/produits',     getProduitsParCategorie);
routeur.get('/:slug',                         getProduitParSlug);

export default routeur;
