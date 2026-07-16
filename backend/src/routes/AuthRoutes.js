import { Router } from 'express';
import { register, login, googleLogin } from '../controllers/auth/AuthController.js';
import validate from '../middlewars/validate.js';
import { registerValidators, loginValidators } from '../validators/authValidators.js';

const router = Router();

/* Inscription classique */
router.post('/register', registerValidators, validate, register);

/* Connexion classique (e-mail ou téléphone + mot de passe) */
router.post('/login', loginValidators, validate, login);

/* Connexion via Google OAuth (credential envoyé par @react-oauth/google) */
router.post('/google', googleLogin);

export default router;
