import { parseBearer } from '../../utils/jwtHelpers.mjs';
import UserService from '../../src/v1/models/user/userService.mjs';
import Message from '../v1/models/message/MessageModel.mjs';

const userSockets = new Map(); // 🧠 userId => WebSocket

export default function setupWs(wss) {
  //==========Connect Message==============================================================================================================================================

  wss.on('connection', async (ws, req) => {
    console.log('✅ Новое WebSocket-соединение');

    // 1️⃣ Извлекаем заголовок с токеном авторизации
    const protocols = req.headers['sec-websocket-protocol'];
    if (!protocols) {
      console.warn('❌ Токен не найден в заголовках WebSocket');
      ws.close();
      return;
    }

    const token = protocols.split(',')[0].trim();
    let userId;

    try {
      // 2️⃣ Декодируем токен
      const payload = parseBearer(`Bearer ${token}`, req.headers);
      userId = payload.id || payload._id;
    } catch (err) {
      console.error('❌ Неверный токен:', err.message);
      ws.close();
      return;
    }

    // 3️⃣ Сохраняем сокет в Map
    userSockets.set(userId, ws);
    console.log(`🧠 Подключен пользователь ${userId}`);
    broadcastOnlineUsers();

    // 4️⃣ Получаем имя пользователя
    let nameUser = 'Anonymous';
    try {
      const user = await UserService.getById(userId);
      if (user) nameUser = user.name;
    } catch (err) {
      console.warn('⚠️ Ошибка получения пользователя:', err.message);
    }

    // 5️⃣ Обработка сообщений от клиента
    ws.on('message', async (msg) => {
      try {
        const data = JSON.parse(msg);

        if (data.type === 'message') {
          const { toUserId, text } = data;
          if (!text?.trim()) return;

          // 💾 Сохраняем сообщение в БД
          const newMessage = await Message.create({
            from: userId,
            to: toUserId,
            text,
            isRead: false,
          });

          const payloadToSend = {
            type: 'new_message',
            from: { id: userId, name: nameUser },
            to: toUserId,
            text,
            timestamp: Date.now(),
          };

          // 📤 Отправляем получателю, если он онлайн
          const receiver = userSockets.get(toUserId);
          if (receiver && receiver.readyState === WebSocket.OPEN) {
            receiver.send(JSON.stringify(payloadToSend));
          }

          // 📨 Отправляем также отправителю для подтверждения
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(payloadToSend));
          }
        }
      } catch (err) {
        console.error('⚠️ Ошибка обработки сообщения:', err.message);
      }
    });

    // 6️⃣ Очистка Map при отключении
    ws.on('close', () => {
      console.log(`📴 Пользователь ${userId} отключился`);
      if (userSockets.get(userId) === ws) {
        userSockets.delete(userId);
        console.log(`🧹 Сокет пользователя ${userId} удалён`);
        broadcastOnlineUsers();
      }
    });
  });
  //============Online User============================================================================================================================================

  function broadcastOnlineUsers() {
    const onlineIds = [...userSockets.keys()];
    const payload = JSON.stringify({
      type: 'online_users',
      userIds: onlineIds,
    });

    userSockets.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  }
}
