import { Schema, model } from 'mongoose';

interface IFarm {
  name: string;
  description: string;
  area: number;
  address: string;
  coordinates: [number, number];
  images: object[];
}

const farmSchema = new Schema<IFarm>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide farm name'],
      maxLength: [100, 'Name can not be more than 100 characters'],
    },
    description: {
      type: String,
    },
    area: {
      type: Number,
    },
    address: {
      type: String,
      required: [true, 'Please provide farm address'],
    },
    coordinates: {
      type: [Number, Number],
    },
    images: {
      type: [
        {
          path: String,
          filename: String,
        },
      ],
      required: [true, 'Please provide farm images'],
    },
  },
  { timestamps: true }
);

export default model<IFarm>('Farm', farmSchema);
