import express from 'express';
import mainRouter from './mains.mjs';
import userRouter from './user.mjs';
import authRouter from './auth.mjs';
import messagesRouter from './messages.mjs';

const router = express.Router();

router.use('/mains', mainRouter);
router.use('/user', userRouter);
router.use('/auth', authRouter);
router.use('/messages', messagesRouter);

export default router;
