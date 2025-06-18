import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import logger from 'morgan';
import cors from 'cors';
import sessionConfig from '../config/session.mjs';
import auth from './auth.mjs';

// Визначення поточного файлу і директорії
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const midleware = (app) => {
  // Middleware для обробки статичних файлів з директорії uploads
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Middleware для підтримки CORS (Cross-Origin Resource Sharing)
  app.use(
    cors({
      // origin: 'http://localhost:5173',
      origin: 'https://elaborate-fox-8284f9.netlify.app',
      credentials: true,
    })
  );

  // Middleware для налаштування сесій
  app.use(sessionConfig);

  // Middleware для логування запитів
  app.use(logger('dev'));

  // Middleware для парсингу cookies
  app.use(cookieParser());

  // Middleware для аутентифікації та авторизації
  auth(app);

  // Middleware для парсингу JSON запитів
  app.use(express.json());

  // Middleware для парсингу URL-кодованих даних
  app.use(express.urlencoded({ extended: false }));

  // Middleware для обробки статичних файлів з директорії public
  app.use(express.static(path.join(__dirname, '../public/')));
};

export default midleware;
