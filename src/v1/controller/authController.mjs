import User from '../models/user/UserModel.mjs';
import UserService from '../models/user/userService.mjs';
import {
  prepareToken,
  parseBearer,
  googleForToken,
} from '../../../utils/jwtHelpers.mjs';
import { OAuth2Client } from 'google-auth-library';
import config from '../../../config/default.mjs';
import userService from '../models/user/userService.mjs';

const googleClient = new OAuth2Client(
  config.googleClientId,
  config.googleClientSecret,
  config.googleRedirectUri
);

class AuthController {
  //-------Register-----------
  static async signup(req, res) {
    try {
      const { email, password, name, avatar } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: 'Email and password are required' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const newUser = new User({ name, email, password, avatar });
      const savedUser = await newUser.save();

      const token = prepareToken({ id: savedUser._id }, req.headers);

      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
          maxAge: 1 * 24 * 60 * 60 * 1000,
        })
        .status(201)
        .json({
          token,
          user: {
            _id: savedUser._id,
            email: savedUser.email,
            name: savedUser.name,
            avatar: savedUser.avatar,
          },
        });
    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ error: 'Signup error' });
    }
  }

  //------Login--------------
  static async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const user = await UserService.findOne({ email });
      if (!user || !user.validPassword(password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = prepareToken({ id: user._id }, req.headers);

      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
          maxAge: 1 * 24 * 60 * 60 * 1000,
        })
        .status(200)
        .json({
          token,
          result: 'Authorized',
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
          },
        });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login error' });
    }
  }
  //--------Login & Register Google---------
  static async googleCallbackLogin(req, res) {
    const { code } = req.query;

    try {
      const { tokens } = await googleClient.getToken({
        code,
        redirect_uri: config.googleRedirectUri,
      });

      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: config.googleClientId,
      });

      const payload = ticket.getPayload();
      const { email, name, picture } = payload;

      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email,
          name: name,
          avatar: picture,
        });
        await user.save();
      }

      const token = prepareToken(
        { _id: user._id, email: user.email },
        req.headers
      );

      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
          maxAge: 1 * 24 * 60 * 60 * 1000,
        })
        .redirect(`${config.clientURl}/auth/success`);
    } catch (err) {
      console.error('Google OAuth error:', err);
      res.status(401).json({ message: 'OAuth login failed' });
    }
  }

  //-----------Me------------------

  static async me(req, res) {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const decoded = parseBearer(`Bearer ${token}`, req.headers);
      const user = await userService.getById(decoded._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      });
    } catch (e) {
      console.error('Auth check failed:', e);
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}

export default AuthController;
