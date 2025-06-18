import config from './default.mjs';
import session from "express-session";
import MongoStore from 'connect-mongo';

const sessionConfig = session({
  secret: config.sess_secret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.mongoURI,
    ttl: 60,
  }),
  cookie: {maxAge: 24 * 60 * 60 * 1000},// 1 Доба
});

export default sessionConfig;