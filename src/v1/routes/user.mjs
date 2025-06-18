import UserController from '../controller/userControler.mjs';
import { Router } from 'express';
import ValidateUsSchem from '../../../validate/validateUser.mjs';
import upload from '../../../utils/uploadManager.mjs';

const router = Router();

router.get('/list', UserController.getListUser);

router.post('/avatar', upload.single('avatar'), UserController.avatarEdit);

router.post('/edit', UserController.userEdit);

export default router;
