import { Router } from 'express';
import { protect } from '../middlewares/authentification.js';
import { limiteurDebit } from '../middlewares/limiteurDebit.js';
import {
  getConversations,
  demarrerConversation,
  getConversation,
  getMessages,
  posterMessage,
  marquerLue,
  getNonLus,
} from '../controllers/MessagerieControleur.js';

const routeur = Router();

routeur.use(protect);

/* Anti-spam : 30 messages par minute et par utilisateur, 20 nouvelles conversations par heure */
const limiteMessages = limiteurDebit({
  max: 30, fenetreMs: 60 * 1000, cle: (req) => `msg:${req.user._id}`,
  message: 'Vous envoyez des messages trop rapidement. Patientez quelques secondes.',
});
const limiteConversations = limiteurDebit({
  max: 20, fenetreMs: 60 * 60 * 1000, cle: (req) => `conv:${req.user._id}`,
  message: 'Trop de nouvelles conversations. Réessayez plus tard.',
});

/* /api/messagerie */
routeur.get('/non-lus',                      getNonLus);
routeur.get('/conversations',                getConversations);
routeur.post('/conversations',               limiteConversations, demarrerConversation);
routeur.get('/conversations/:id',            getConversation);
routeur.get('/conversations/:id/messages',   getMessages);
routeur.post('/conversations/:id/messages',  limiteMessages, posterMessage);
routeur.patch('/conversations/:id/lue',      marquerLue);

export default routeur;
