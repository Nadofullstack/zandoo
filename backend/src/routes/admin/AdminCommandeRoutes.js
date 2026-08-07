import { Router } from 'express';
import {
  getStatistiquesCommandes,
  getCommandes,
  getCommandeParId,
  modifierStatutCommande,
  modifierNotesCommande,
  assignerLivreur,
} from '../../controllers/admin/AdminCommandeControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';
import {
  validerIdCommande,
  validerChangementStatut,
  validerNotesAdmin,
  validerFiltresCommandes,
  validerAssignationLivreur,
} from '../../validators/commandeValidators.js';
import { validationResult } from 'express-validator';

const routeur = Router();

/* Toutes les routes admin nécessitent un token valide + rôle admin */
routeur.use(protect, requireRole('admin'));

/* Middleware de gestion des erreurs de validation */
const gererErreurs = (req, res, next) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    return res.status(422).json({ success: false, errors: erreurs.array() });
  }
  next();
};

/* GET  /api/admin/commandes/statistiques */
routeur.get('/statistiques', getStatistiquesCommandes);

/* GET  /api/admin/commandes */
routeur.get('/', validerFiltresCommandes, gererErreurs, getCommandes);

/* GET  /api/admin/commandes/:id */
routeur.get('/:id', validerIdCommande, gererErreurs, getCommandeParId);

/* PATCH /api/admin/commandes/:id/statut */
routeur.patch('/:id/statut', validerChangementStatut, gererErreurs, modifierStatutCommande);

/* PATCH /api/admin/commandes/:id/notes */
routeur.patch('/:id/notes', validerNotesAdmin, gererErreurs, modifierNotesCommande);

/* PATCH /api/admin/commandes/:id/livreur */
routeur.patch('/:id/livreur', validerAssignationLivreur, gererErreurs, assignerLivreur);

export default routeur;
