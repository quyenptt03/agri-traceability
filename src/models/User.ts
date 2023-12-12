import { Schema, model, Document } from 'mongoose';
import validator from 'validator';
import { genSalt, hash, compare } from 'bcrypt';

export interface IUser extends Document {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  password: string;
  address?: string;
  phone?: string;
  role: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    first_name: {
      type: String,
      trim: true,
      maxLength: [100, 'Firstname can not be more than 100 characters'],
    },
    last_name: {
      type: String,
      trim: true,
      maxLength: [100, 'Lastname can not be more than 100 characters'],
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, 'Please provide email'],
      validate: [validator.isEmail, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minLength: [6, 'Password can not be less than 6 characters'],
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
      trim: true,
      minLength: [10, 'Phone must be 10 numbers'],
      maxLength: [10, 'Phone must be 10 numbers'],
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'user'],
      default: 'user',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  const isMatch = await compare(candidatePassword, this.password);
  return isMatch;
};

export default model<IUser>('User', userSchema);
