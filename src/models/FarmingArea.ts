import { Schema, model } from "mongoose";

interface IFarmingArea {
  name: string;
  description: string;
  area: number;
  address: string;
  coordinates: [number, number];
  images: [string];
}

const farmingAreaSchema = new Schema<IFarmingArea>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide farming area name"],
      maxLength: [100, "Name can not be more than 100 characters"],
    },
    description: {
      type: String,
    },
    area: {
      type: Number,
      required: [true, "Please provide the area"],
    },
    address: {
      type: String,
      required: [true, "Please provide farming area address"],
    },
    coordinates: {
      type: [Number, Number],
      required: [true, "Please provide the coordinates"],
    },
    images: {
      type: [String],
      required: [true, "Please provide farming area images"],
    },
  },
  { timestamps: true }
);

export default model<IFarmingArea>("FarmingArea", farmingAreaSchema);
