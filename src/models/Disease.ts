import { Schema, model, Types } from "mongoose";

interface IDisease {
  name: string;
  description: string;
  symptoms: string;
  preventive_measures: string;
  images: [string];
}

const diseaseSchema = new Schema<IDisease>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide disease name"],
      maxLength: [500, "Name can not be more than 500 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide disease description"],
    },
    symptoms: {
      type: String,
      required: [true, "Please provide disease symptoms"],
    },
    preventive_measures: {
      type: String,
      required: [true, "Please provide the disease's preventive measures"],
    },
    images: {
      type: [String],
      required: [true, "Please provide disease images"],
    },
  },
  { timestamps: true }
);

export default model<IDisease>("Disease", diseaseSchema);
