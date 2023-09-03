import { Schema, model, Types } from "mongoose";

interface IPestCategory {
  name: string;
  description: string;
  image: string;
}

const pestCategorySchema = new Schema<IPestCategory>(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Please provide pest category name"],
      maxLength: [100, "Name can not be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide pest category description"],
    },
    image: {
      type: String,
      required: [true, "Please provide pest category image"],
    },
  },
  { timestamps: true }
);

export default model<IPestCategory>("PestCategory", pestCategorySchema);
