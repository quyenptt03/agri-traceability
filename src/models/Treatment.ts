import { Schema, Types, model } from 'mongoose';

interface ITreatment {
  farm_product: Types.ObjectId;
  disease_pest: Types.ObjectId;
  name: string;
  description: string;
  method: string;
  medicine: Types.ObjectId;
}

const treatmentSchema = new Schema<ITreatment>(
  {
    farm_product: {
      type: Schema.Types.ObjectId,
      ref: 'FarmProduct',
      required: true,
    },
    disease_pest: {
      type: Schema.Types.ObjectId,
      ref: 'Disease' || 'Pest',
      required: true,
    },
    name: {
      type: String,
      trim: true,
      maxLength: [500, 'Name can not be more than 500 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide treatment description'],
    },
    method: {
      type: String,
      required: [true, 'Please provide the treatment method'],
    },
    medicine: {
      type: Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
  },
  { timestamps: true }
);

export default model<ITreatment>('Treatment', treatmentSchema);
