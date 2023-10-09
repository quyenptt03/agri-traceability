import { Schema, model, Types } from 'mongoose';

interface ICategory {
  name: string;
  slug: string;
  description: string;
  image: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide category name'],
      maxLength: [100, 'Name can not be more than 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      autoIndex: false,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide category description'],
    },
    image: {
      type: String,
      required: [true, 'Please provide category image'],
    },
  },
  { timestamps: true }
);

export default model<ICategory>('Category', categorySchema);
