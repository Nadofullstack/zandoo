import { Router } from 'express';
import { enregistrerImpressions, enregistrerClic } from '../../controllers/acheteur/PubliciteSuiviControleur.js';

const routeur = Router();

/* /api/acheteur/publicites — mesure d'audience des campagnes (public) */
routeur.post('/impressions', enregistrerImpressions);
routeur.post('/:id/clic',    enregistrerClic);

export default routeur;
