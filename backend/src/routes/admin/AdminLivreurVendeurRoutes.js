import { Router } from 'express';
import {
  getTousLesLivreursVendeurs,
  getLivreursParVendeur,
  getLivreurVendeurParId,
  modifierStatutLivreurVendeur,
} from '../../controllers/admin/AdminLivreurVendeurControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';

const routeur = Router();

/* Toutes les routes nécessitent un token valide + rôle admin */
routeur.use(protect, requireRole('admin'));

/* ── Vue globale : tous les livreurs créés par des vendeurs ─────────────── */

/* GET /api/admin/livreurs-vendeurs                      — liste globale */
routeur.get('/', getTousLesLivreursVendeurs);

/* ── Vue par vendeur ────────────────────────────────────────────────────── */

/* GET   /api/admin/livreurs-vendeurs/:vendeurId              — liste du vendeur */
routeur.get('/:vendeurId', getLivreursParVendeur);

/* GET   /api/admin/livreurs-vendeurs/:vendeurId/:livreurId   — profil complet */
routeur.get('/:vendeurId/:livreurId', getLivreurVendeurParId);

/* PATCH /api/admin/livreurs-vendeurs/:vendeurId/:livreurId/statut */
routeur.patch('/:vendeurId/:livreurId/statut', modifierStatutLivreurVendeur);

export default routeur;
