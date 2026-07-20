import { Router } from 'express';
import {
  getStatistiquesArticles, getArticles, getArticleParId,
  creerArticle, modifierArticle, supprimerArticle,
} from '../../controllers/admin/AdminArticleControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';
import {
  validerIdArticle, validerCreerArticle, validerModifierArticle, validerFiltresArticles,
} from '../../validators/contenuValidators.js';

const routeur = Router();
routeur.use(protect, requireRole('admin'));

routeur.get('/statistiques', getStatistiquesArticles);
routeur.get('/',    validerFiltresArticles, getArticles);
routeur.get('/:id', validerIdArticle,       getArticleParId);
routeur.post('/',   validerCreerArticle,    creerArticle);
routeur.put('/:id', validerModifierArticle, modifierArticle);
routeur.delete('/:id', validerIdArticle,    supprimerArticle);

export default routeur;
