import UserService from '../models/user/userService.mjs';
import fs from 'fs';
import path from 'path';
import UserModel from '../models/user/UserModel.mjs';
import { fileURLToPath } from 'url';
import { prepareToken } from '../../../utils/jwtHelpers.mjs';
import userService from '../models/user/userService.mjs';

// Для поддержки __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UserController {
  //========================================================================================================================================================
  static async getListUser(req, res) {
    try {
      const result = await UserService.getList({}, { password: 0 });
      res.status(200).json(result);
    } catch (err) {
      console.error('Get list users error', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
  //========================================================================================================================================================

  static async avatarEdit(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const filename = req.file.filename;
      const avatarPath = `/uploads/${filename}`;
      const userId = req.body.userID;
      // Найдём текущего пользователя (для удаления старого аватара)
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Если у пользователя был старый аватар, удаляем его
      if (user.avatar && user.avatar.startsWith('/uploads/')) {
        // path.basename(user.avatar) вернёт что-то вроде '00012e43-....jpg'
        const oldAvatarPath = path.resolve(
          __dirname,
          '../../../uploads',
          path.basename(user.avatar)
        );

        try {
          await fs.promises.unlink(oldAvatarPath);
          console.log('Old avatar removed:', oldAvatarPath);
        } catch (err) {
          console.warn("Can't Failed to delete old avatar:", err.message);
        }
      }

      // Обновляем пользователя новым путём к аватару
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { avatar: avatarPath },
        { new: true }
      );

      res.json({ message: 'Avatar updated', user: updatedUser });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
  //========================================================================================================================================================
  static async userEdit(req, res) {
    try {
      const { _id, ...data } = req.body;
      const result = await UserService.update(_id, data);
      const token = prepareToken({ id: result.id }, req.headers);

      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
          maxAge: 1 * 24 * 60 * 60 * 1000,
        })
        .status(200)
        .json({
          _id: result._id,
          name: result.name,
          email: result.email,
          avatar: result.avatar,
        });
    } catch (err) {
      console.error('Edit user error', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

export default UserController;
