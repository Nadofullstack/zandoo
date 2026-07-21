import { Router } from 'express';
import {
  verifierTokenActivation,
  changerMotDePasseInitial,
  completerProfil,
  getMonProfil,
} from '../controllers/livreur/LivreurAuthControleur.js';
import { protect, requireRole } from '../middlewars/authentification.js';

const routeur = Router();

/* ── Routes publiques (pas de JWT requis) ────────────────────── */

/* GET  /api/livreur/activation/:token/verifier */
routeur.get(
  '/activation/:token/verifier',
  verifierTokenActivation
);

/* POST /api/livreur/activation/:token/changer-mot-de-passe */
routeur.post(
  '/activation/:token/changer-mot-de-passe',
  changerMotDePasseInitial
);

/* ── Routes protégées (JWT + rôle livreur) ───────────────────── */

/* GET  /api/livreur/profil */
routeur.get(
  '/profil',
  protect,
  requireRole('livreur'),
  getMonProfil
);

/* PUT  /api/livreur/profil */
routeur.put(
  '/profil',
  protect,
  requireRole('livreur'),
  completerProfil
);

export default routeur;
