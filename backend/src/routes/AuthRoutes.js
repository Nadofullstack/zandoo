import { Router } from 'express';
import { register, login, logout, googleLogin } from '../controllers/auth/AuthController.js';
import validate from '../middlewars/validate.js';
import { registerValidators, loginValidators } from '../validators/authValidators.js';

const router = Router();

router.post('/register', registerValidators, validate, register);
router.post('/login',    loginValidators,    validate, login);
router.post('/logout',   logout);
router.post('/google',   googleLogin);

export default router;
