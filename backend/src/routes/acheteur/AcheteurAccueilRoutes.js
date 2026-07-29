import { Router } from 'express';
import { getAccueil } from '../../controllers/acheteur/AccueilControleur.js';

const routeur = Router();

/* Route publique — aucune authentification requise */
routeur.get('/', getAccueil);

export default routeur;
