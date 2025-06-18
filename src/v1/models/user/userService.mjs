import User from './UserModel.mjs';
import CRUDManager from '../CRUDManager.mjs';

class UserService extends CRUDManager {
  constructor() {
    super(User);
  }
}

export default new UserService(User);
