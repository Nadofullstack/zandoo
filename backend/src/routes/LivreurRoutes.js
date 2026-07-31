import { Router } from 'express';
import {
  verifierTokenActivation,
  changerMotDePasseInitial,
  completerProfil,
  getMonProfil,
} from '../controllers/livreur/LivreurAuthControleur.js';
import {
  getTableauDeBord,
  getMesLivraisons,
  getHistoriqueLivraisons,
  marquerLivree,
} from '../controllers/livreur/LivreurDashboardControleur.js';
import { protect, requireRole } from '../middlewars/authentification.js';

const routeur = Router();

/* ── Routes publiques (pas de JWT requis) ────────────────────── */
routeur.get('/activation/:token/verifier',                    verifierTokenActivation);
routeur.post('/activation/:token/changer-mot-de-passe',       changerMotDePasseInitial);

/* ── Routes protégées (JWT + rôle livreur) ───────────────────── */
const auth = [protect, requireRole('livreur')];

routeur.get( '/profil',                          ...auth, getMonProfil);
routeur.put( '/profil',                          ...auth, completerProfil);
routeur.get( '/tableau-de-bord',                 ...auth, getTableauDeBord);
routeur.get( '/commandes',                       ...auth, getMesLivraisons);
routeur.get( '/commandes/historique',            ...auth, getHistoriqueLivraisons);
routeur.patch('/commandes/:id/livree',           ...auth, marquerLivree);

export default routeur;
