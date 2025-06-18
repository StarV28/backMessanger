import dotenv from 'dotenv';
dotenv.config();

export default Object.freeze({
  port: process.env.PORT || 3000,
  databaseName: process.env.DB_NAME,
  databaseUrl: process.env.MONGODB_URL,
  mongoURI: `${process.env.MONGODB_URL}${process.env.DB_NAME}`,
  sess_secret: process.env.SECRET_SESSION,
  jwt_secret: process.env.JWT_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
  clientURl: process.env.CLIENT_URL,
});
