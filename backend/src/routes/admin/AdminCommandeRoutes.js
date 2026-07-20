import { Router } from 'express';
import {
  getStatistiquesCommandes,
  getCommandes,
  getCommandeParId,
  modifierStatutCommande,
  modifierNotesCommande,
} from '../../controllers/admin/AdminCommandeControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';
import {
  validerIdCommande,
  validerChangementStatut,
  validerNotesAdmin,
  validerFiltresCommandes,
} from '../../validators/commandeValidators.js';

const routeur = Router();

/* Toutes les routes admin nécessitent un token valide + rôle admin */
routeur.use(protect, requireRole('admin'));

/* GET  /api/admin/commandes/statistiques */
routeur.get('/statistiques', getStatistiquesCommandes);

/* GET  /api/admin/commandes              — liste paginée + filtres */
routeur.get('/', validerFiltresCommandes, getCommandes);

/* GET  /api/admin/commandes/:id          — détail complet */
routeur.get('/:id', validerIdCommande, getCommandeParId);

/* PATCH /api/admin/commandes/:id/statut  — changer le statut */
routeur.patch('/:id/statut', validerChangementStatut, modifierStatutCommande);

/* PATCH /api/admin/commandes/:id/notes   — notes internes admin */
routeur.patch('/:id/notes', validerNotesAdmin, modifierNotesCommande);

export default routeur;
