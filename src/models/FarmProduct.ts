import { object } from 'joi';
import { Schema, model, Types } from 'mongoose';

interface IFarmProduct {
  name: string;
  category: Types.ObjectId;
  description: string;
  origin: string;
  variety: string;
  cultivation_time: string;
  type: string;
  images: object[];
  farming_area: Types.ObjectId;
  qrcode: string;
  user: Types.ObjectId;
}

const farmProductSchema = new Schema<IFarmProduct>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide farm product name'],
      maxLength: [100, 'Name can not be more than 100 characters'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      require: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide farm product description'],
    },
    origin: {
      type: String,
      default: 'Vietnam',
    },
    cultivation_time: {
      type: String,
    },
    type: {
      type: String,
      required: [true, 'Please provide farm product type'],
      enum: {
        values: ['Plant', 'Animal'],
        message: '{VALUE} is not supported',
      },
    },
    images: {
      type: [
        {
          path: String,
          filename: String,
        },
      ],
      required: [true, 'Please provide farm product images'],
    },
    farming_area: {
      type: Schema.Types.ObjectId,
      ref: 'FarmingArea',
      require: true,
    },
    qrcode: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },

  { timestamps: true }
);

export default model<IFarmProduct>('FarmProduct', farmProductSchema);
