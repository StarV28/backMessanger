import express from 'express';
import MessageController from '../controller/MessageController.mjs';

const router = express.Router();

router.get('/:id', MessageController.getMessages);

router.get('/unread/list', MessageController.getUnreadList);

router.patch('/read/:fromUserId', MessageController.markAsRead);

export default router;
