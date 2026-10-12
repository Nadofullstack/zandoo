import { Router } from 'express';
import { checkout, getOptionsLivraison } from '../../controllers/acheteur/CheckoutControleur.js';
import {
  getMesCommandes,
  getCommandeParId,
  getGroupeCommandes,
  annulerMaCommande,
  getResumeCommandes,
} from '../../controllers/acheteur/CommandeAcheteurControleur.js';
import { protect }             from '../../middlewares/authentification.js';
import {
  validerCheckout,
  validerOptionsLivraison,
  validerFiltresCommandesAcheteur,
  validerIdCommandeAcheteur,
  validerGroupeCommandeId,
  validerAnnulationAcheteur,
} from '../../validators/checkoutValidators.js';
import { validationResult }    from 'express-validator';

const routeur = Router();

/* Toutes les routes acheteur nécessitent un token valide */
routeur.use(protect);

/* Middleware de gestion des erreurs de validation */
const gererErreurs = (req, res, next) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    return res.status(422).json({ success: false, message: erreurs.array()[0].msg, errors: erreurs.array() });
  }
  next();
};

/* POST /api/acheteur/checkout/options-livraison — frais et modes par boutique pour une ville */
routeur.post('/checkout/options-livraison', validerOptionsLivraison, gererErreurs, getOptionsLivraison);

/* POST /api/acheteur/checkout — passage en caisse */
routeur.post('/checkout', validerCheckout, gererErreurs, checkout);

/* GET  /api/acheteur/commandes — mes commandes */
routeur.get('/commandes', validerFiltresCommandesAcheteur, gererErreurs, getMesCommandes);

/* GET  /api/acheteur/commandes/resume — chiffres clés (avant /:id pour ne pas être capturé) */
routeur.get('/commandes/resume', getResumeCommandes);

/* GET  /api/acheteur/commandes/groupe/:groupeCommandeId — toutes les sous-commandes d'un panier */
routeur.get('/commandes/groupe/:groupeCommandeId', validerGroupeCommandeId, gererErreurs, getGroupeCommandes);

/* GET  /api/acheteur/commandes/:id — détail d'une commande */
routeur.get('/commandes/:id', validerIdCommandeAcheteur, gererErreurs, getCommandeParId);

/* PATCH /api/acheteur/commandes/:id/annuler — annulation par l'acheteur (avant traitement) */
routeur.patch('/commandes/:id/annuler', validerAnnulationAcheteur, gererErreurs, annulerMaCommande);

export default routeur;
