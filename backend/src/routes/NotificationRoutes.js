import { Router } from 'express';
import { protect } from '../middlewares/authentification.js';
import {
  getNotifications,
  getNombreNonLues,
  marquerNotificationLue,
  toutMarquerLu,
} from '../controllers/NotificationControleur.js';

const routeur = Router();

routeur.use(protect);

/* /api/notifications */
routeur.get('/',            getNotifications);
routeur.get('/non-lues',    getNombreNonLues);
routeur.patch('/tout-lire', toutMarquerLu);
routeur.patch('/:id/lue',   marquerNotificationLue);

export default routeur;
