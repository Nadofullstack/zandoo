import { Router } from 'express';
import { checkout }            from '../../controllers/acheteur/CheckoutControleur.js';
import {
  getMesCommandes,
  getCommandeParId,
  getGroupeCommandes,
} from '../../controllers/acheteur/CommandeAcheteurControleur.js';
import { protect }             from '../../middlewars/authentification.js';
import {
  validerCheckout,
  validerFiltresCommandesAcheteur,
  validerIdCommandeAcheteur,
  validerGroupeCommandeId,
} from '../../validators/checkoutValidators.js';
import { validationResult }    from 'express-validator';

const routeur = Router();

/* Toutes les routes acheteur nécessitent un token valide */
routeur.use(protect);

/* Middleware de gestion des erreurs de validation */
const gererErreurs = (req, res, next) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    return res.status(422).json({ success: false, errors: erreurs.array() });
  }
  next();
};

/* POST /api/acheteur/checkout — passage en caisse */
routeur.post('/checkout', validerCheckout, gererErreurs, checkout);

/* GET  /api/acheteur/commandes — mes commandes */
routeur.get('/commandes', validerFiltresCommandesAcheteur, gererErreurs, getMesCommandes);

/* GET  /api/acheteur/commandes/groupe/:groupeCommandeId — toutes les sous-commandes d'un panier */
routeur.get('/commandes/groupe/:groupeCommandeId', validerGroupeCommandeId, gererErreurs, getGroupeCommandes);

/* GET  /api/acheteur/commandes/:id — détail d'une commande */
routeur.get('/commandes/:id', validerIdCommandeAcheteur, gererErreurs, getCommandeParId);

export default routeur;
