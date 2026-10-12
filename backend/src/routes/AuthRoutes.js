import { Router } from 'express';
import { register, login, logout, googleLogin, getMe, updateMe } from '../controllers/auth/AuthController.js';
import validate from '../middlewares/validate.js';
import { registerValidators, loginValidators } from '../validators/authValidators.js';
import { protect } from '../middlewares/authentification.js';

const router = Router();

router.post('/register', registerValidators, validate, register);
router.post('/login',    loginValidators,    validate, login);
router.post('/logout',   logout);
router.post('/google',   googleLogin);
router.get('/me',        protect, getMe);
router.put('/me',        protect, updateMe);

export default router;
