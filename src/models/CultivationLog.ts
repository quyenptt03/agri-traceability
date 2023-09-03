import { Schema, Types, model } from "mongoose";

interface ICultivationLog {
  farm_product: Types.ObjectId;
  activity: Types.ObjectId;
  notes?: string;
  images: [string];
}

const cultivationLogSchema = new Schema<ICultivationLog>(
  {
    farm_product: {
      type: Schema.Types.ObjectId,
      ref: "FarmProduct",
      required: true,
    },
    activity: {
      type: Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
    notes: {
      type: String,
    },
    images: {
      type: [String],
      required: [true, "Please provide cultivation log images"],
    },
  },
  { timestamps: true }
);

export default model<ICultivationLog>("CultivationLog", cultivationLogSchema);
