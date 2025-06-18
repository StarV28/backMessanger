import express from 'express';
import ValidateUsSchema from '../../../validate/validateUser.mjs';

import AuthController from '../controller/authController.mjs';

const router = express.Router();

router.post('/register', ValidateUsSchema.userValid, AuthController.signup);

router.post('/login', AuthController.login);

router.get('/google/callback', AuthController.googleCallbackLogin);

router.get('/me', AuthController.me);

export default router;
