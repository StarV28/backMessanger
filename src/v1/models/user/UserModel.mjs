import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [false, 'Username is required'],
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [20, 'Username must be at most 20 characters long'],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // minlength: [6, 'Password must be at least 6 characters long'],
      // maxlength: [16, 'Password must be at most 16 characters long'],
      // validate: {
      //   validator: function (v) {
      //     return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v)
      //   },
      //   message: (props) =>
      //     'Password must contain at least one letter, one number, and one special character',
      // },
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      // lowercase: true,
      // trim: true,
    },
    avatar: {
      type: String,
    },
    isAdmin: { type: Boolean, default: false },
  },
  { collection: 'user' }
);

// Хешування паролю перед збереженням
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//---------------- Функція для перевірки правильності пароля ------------
userSchema.methods.validPassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);

  return isMatch;
};

const User = mongoose.model('User', userSchema);

export default User;
