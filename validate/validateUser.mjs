import { body } from 'express-validator';

class ValidateUsSchema {
  static userValid = [
    body('nickname')
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 3, max: 15 })
      .withMessage('Name must be between 3 and 15 characters long')
      .trim()
      .escape(),
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email must be valid')
      .normalizeEmail({ remove_dots: false })
      .trim()
      .escape(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6, max: 16 })
      .withMessage('Password must be between 8 and 20 characters long'),
  ];
}

export default ValidateUsSchema;
