import { Schema, model } from 'mongoose';

interface IFarmingArea {
  name: string;
  description: string;
  area: number;
  address: string;
  coordinates: [number, number];
  images: { path: string; filename: string }[];
}

const farmingAreaSchema = new Schema<IFarmingArea>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide farming area name'],
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
      required: [true, 'Please provide farming area address'],
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
      required: [true, 'Please provide farming area images'],
    },
  },
  { timestamps: true }
);

export default model<IFarmingArea>('FarmingArea', farmingAreaSchema);
