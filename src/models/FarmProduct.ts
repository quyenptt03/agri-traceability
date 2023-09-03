import { Schema, model, Types } from "mongoose";

interface IFarmProduct {
  name: string;
  category: Types.ObjectId;
  description: string;
  origin: string;
  variety: string;
  average_lifespan: number;
  type: string;
  images: [string];
  farming_area: Types.ObjectId;
  qr_code: string;
}

const farmProductSchema = new Schema<IFarmProduct>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide farm product name"],
      maxLength: [100, "Name can not be more than 100 characters"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      require: true,
    },
    description: {
      type: String,
      required: [true, "Please provide farm product description"],
    },
    origin: {
      type: String,
      required: [true, "Please provide farm product origin"],
      default: "Vietnam",
    },
    variety: {
      type: String,
      required: [true, "Please provide farm product variety"],
    },
    average_lifespan: {
      type: Number,
      required: [true, "Please provide farm product average lifespan"],
    },
    type: {
      type: String,
      required: [true, "Please provide farm product type"],
      enum: {
        values: ["Plant", "Animal"],
        message: "{VALUE} is not supported",
      },
    },
    images: {
      type: [String],
      required: [true, "Please provide farm product images"],
    },
    farming_area: {
      type: Schema.Types.ObjectId,
      ref: "FarmingArea",
      require: true,
    },
    qr_code: {
      type: String,
    },
  },
  { timestamps: true }
);

export default model<IFarmProduct>("FarmProduct", farmProductSchema);
