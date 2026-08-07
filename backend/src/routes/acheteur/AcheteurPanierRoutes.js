import { Router } from 'express';
import {
  getPanier,
  ajouterAuPanier,
  modifierQuantite,
  retirerDuPanier,
  viderPanier,
} from '../../controllers/acheteur/PanierControleur.js';
import { protect } from '../../middlewars/authentification.js';

const routeur = Router();

/* Toutes les routes panier nécessitent un token valide */
routeur.use(protect);

/* GET    /api/acheteur/panier — récupère le panier */
routeur.get('/', getPanier);

/* POST   /api/acheteur/panier — ajoute un produit au panier */
routeur.post('/', ajouterAuPanier);

/* PUT    /api/acheteur/panier/:ligneId — modifie la quantité d'une ligne */
routeur.put('/:ligneId', modifierQuantite);

/* DELETE /api/acheteur/panier/:ligneId — retire une ligne du panier */
routeur.delete('/:ligneId', retirerDuPanier);

/* DELETE /api/acheteur/panier — vide le panier */
routeur.delete('/', viderPanier);

export default routeur;
