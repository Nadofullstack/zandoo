import { Router } from 'express';
import {
  getStatistiquesReclamations,
  getReclamations,
  getReclamationParId,
  modifierStatutReclamation,
  ajouterMessage,
  assignerReclamation,
  modifierPriorite,
  modifierNotesAdmin,
} from '../../controllers/admin/AdminReclamationControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';
import {
  validerIdReclamation,
  validerFiltresReclamations,
  validerChangementStatut,
  validerAjoutMessage,
  validerAssignation,
  validerChangementPriorite,
  validerNotesAdmin,
} from '../../validators/reclamationValidators.js';

const routeur = Router();

/* Toutes les routes admin nécessitent un token valide + rôle admin */
routeur.use(protect, requireRole('admin'));

/* GET  /api/admin/reclamations/statistiques */
routeur.get('/statistiques', getStatistiquesReclamations);

/* GET  /api/admin/reclamations              — liste paginée + filtres */
routeur.get('/', validerFiltresReclamations, getReclamations);

/* GET  /api/admin/reclamations/:id          — détail complet + messages */
routeur.get('/:id', validerIdReclamation, getReclamationParId);

/* PATCH /api/admin/reclamations/:id/statut  — changer le statut */
routeur.patch('/:id/statut', validerChangementStatut, modifierStatutReclamation);

/* POST  /api/admin/reclamations/:id/messages — répondre dans le fil */
routeur.post('/:id/messages', validerAjoutMessage, ajouterMessage);

/* PATCH /api/admin/reclamations/:id/assigner — assigner à un admin */
routeur.patch('/:id/assigner', validerAssignation, assignerReclamation);

/* PATCH /api/admin/reclamations/:id/priorite — changer la priorité */
routeur.patch('/:id/priorite', validerChangementPriorite, modifierPriorite);

/* PATCH /api/admin/reclamations/:id/notes    — notes internes admin */
routeur.patch('/:id/notes', validerNotesAdmin, modifierNotesAdmin);

export default routeur;
