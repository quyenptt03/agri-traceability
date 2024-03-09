import { Schema, Types, model } from 'mongoose';
interface IProduct {
  name: string;
  description: string;
  images: object[];
  notes: string;
  production_date: Date;
  expiration_date: Date;
  herd: Types.ObjectId;
  user: Types.ObjectId;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    trim: true,
    required: [true, "Please provide product's name"],
    maxLength: [100, 'Name can not be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide farm product description'],
  },
  images: {
    type: [
      {
        path: String,
        filename: String,
      },
    ],
    required: [true, 'Please provide product images'],
  },
  notes: {
    type: String,
  },
  production_date: {
    type: Date,
    default: Date.now,
  },
  expiration_date: {
    type: Date,
    required: [true, "Please provide product's expiration date"],
  },
  herd: {
    type: Schema.Types.ObjectId,
    ref: 'Herd',
    require: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

export default model<IProduct>('Product', productSchema);
