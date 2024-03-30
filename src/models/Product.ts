import { Schema, Types, model } from 'mongoose';
interface IProduct {
  name: string;
  description: string;
  price: number;
  unit: string;
  images: object[];
  notes: string;
  production_date: Date;
  expiration_date: Date;
  storage_method: string;
  qrcode: string;
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
  price: {
    type: Number,
    required: [true, 'Please provide the price'],
    validate: {
      validator: function (v: number) {
        return v > 0;
      },
      message: (props) => `${props.value} is not a positive number!`,
    },
  },
  unit: {
    type: String,
    default: 'Đồng',
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
  storage_method: {
    type: String,
    maxLength: [500, 'Storage method can not be more than 500 characters'],
  },
  qrcode: {
    type: String,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

export default model<IProduct>('Product', productSchema);
