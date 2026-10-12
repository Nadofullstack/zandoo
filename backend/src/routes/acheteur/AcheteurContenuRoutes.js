import { Router } from 'express';
import { getPagesPubliees, getPagePubliee } from '../../controllers/acheteur/PageControleur.js';
import { contacter } from '../../controllers/acheteur/ContactControleur.js';
import { limiteurDebit } from '../../middlewares/limiteurDebit.js';

const routeur = Router();

/* 5 messages de contact par IP et par quart d'heure */
const limiteContact = limiteurDebit({
  max: 5,
  fenetreMs: 15 * 60 * 1000,
  message: 'Vous avez envoyé plusieurs messages récemment. Merci de patienter quelques minutes.',
});

/* /api/acheteur — contenus publics (aucune authentification) */
routeur.get('/pages',        getPagesPubliees);
routeur.get('/pages/:slug',  getPagePubliee);
routeur.post('/contact',     limiteContact, contacter);

export default routeur;
