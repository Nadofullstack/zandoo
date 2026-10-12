import { Router } from 'express';
import { protect } from '../../middlewares/authentification.js';
import {
  getMonAvisProduit,
  getMesAvisCommande,
  creerAvis,
  modifierAvis,
  supprimerAvis,
} from '../../controllers/acheteur/AvisControleur.js';

const routeur = Router();

routeur.use(protect);

/* /api/acheteur/avis — avis de l'acheteur connecté (la lecture publique est sous /produits/:id/avis) */
routeur.get('/produit/:produitId',   getMonAvisProduit);
routeur.get('/commande/:commandeId', getMesAvisCommande);
routeur.post('/',                    creerAvis);
routeur.put('/:id',                  modifierAvis);
routeur.delete('/:id',               supprimerAvis);

export default routeur;
