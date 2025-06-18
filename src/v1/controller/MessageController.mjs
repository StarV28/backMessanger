import Message from '../models/message/MessageModel.mjs';
import mongoose from 'mongoose';
import User from '../models/user/UserModel.mjs';

class MessageController {
  //========================================================================================================================================================

  static async getMessages(req, res) {
    const from = req.user._id || req.user.id;
    const to = req.params.id;
    try {
      const messages = await Message.find({
        $or: [
          {
            from: new mongoose.Types.ObjectId(from),
            to: new mongoose.Types.ObjectId(to),
          },
          {
            from: new mongoose.Types.ObjectId(to),
            to: new mongoose.Types.ObjectId(from),
          },
        ],
      })
        .sort({ createdAt: 1 })
        .populate('from to');

      await Message.updateMany(
        {
          from: new mongoose.Types.ObjectId(to),
          to: new mongoose.Types.ObjectId(from),
          isRead: false,
        },
        { $set: { isRead: true } }
      );

      res.json(messages);
    } catch (err) {
      console.error('Ошибка getMessages:', err);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  //========================================================================================================================================================
  static async getUnreadList(req, res) {
    const currentUserId = req.user.id || req.user._id;
    try {
      const aggregate = await Message.aggregate([
        {
          $match: {
            to: new mongoose.Types.ObjectId(currentUserId),
            isRead: false,
          },
        },
        { $group: { _id: '$from', count: { $sum: 1 } } },
      ]);

      // Получаем имя отправителя (если нужно)
      const populated = await User.populate(aggregate, {
        path: '_id',
        select: 'name _id',
      });
      res.json(
        populated.map(({ _id, count }) => ({
          user: _id,
          count,
        }))
      );
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: 'Не удалось получить непрочитанные сообщения' });
    }
  }
  //========================================================================================================================================================
  static async markAsRead(req, res) {
    const currentUserId = req.user.id || req.user._id;
    const fromUserId = req.params.fromUserId;

    try {
      await Message.updateMany(
        { from: fromUserId, to: currentUserId, isRead: false },
        { $set: { isRead: true } }
      );

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Ошибка при обновлении статуса' });
    }
  }
}

export default MessageController;
