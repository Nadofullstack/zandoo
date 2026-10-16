import { Router } from 'express';
import { register, login, logout, googleLogin, getMe, updateMe } from '../controllers/auth/AuthController.js';
import validate from '../middlewares/validate.js';
import { registerValidators, loginValidators } from '../validators/authValidators.js';
import { protect } from '../middlewares/authentification.js';
import {
  limiteConnexionIp,
  limiteConnexionCompte,
  limiteInscription,
  limiteGoogle,
} from '../middlewares/limitesAuthentification.js';

const router = Router();

/* Limites anti force brute : par IP, et par compte visé pour la connexion (échecs uniquement) */
router.post('/register', limiteInscription,                        registerValidators, validate, register);
router.post('/login',    limiteConnexionIp, limiteConnexionCompte, loginValidators,    validate, login);
router.post('/logout',   logout);
router.post('/google',   limiteGoogle, googleLogin);
router.get('/me',        protect, getMe);
router.put('/me',        protect, updateMe);

export default router;
