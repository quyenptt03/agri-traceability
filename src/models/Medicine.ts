import { Schema, model, Types } from 'mongoose';

interface IMedicine {
  name: string;
  description: string;
  ingredients: string;
  usage_instruction: string;
  toxicity: string;
  dosage: string;
  isolation: string;
  recommendation: string;
  certificate: string;
  images: object[];
}

const medicineSchema = new Schema<IMedicine>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide pesticide/veterinary medicine name'],
      maxLength: [500, 'Name can not be more than 500 characters'],
    },
    description: {
      type: String,
      required: [
        true,
        'Please provide pesticide/veterinary medicine description',
      ],
    },
    ingredients: {
      type: String,
      required: [
        true,
        'Please provide pesticide/veterinary medicine ingredients',
      ],
    },
    usage_instruction: {
      type: String,
      required: [
        true,
        "Please provide the pesticide/veterinary medicine's usage instruction",
      ],
    },
    toxicity: {
      type: String,
      required: [
        true,
        "Please provide the pesticide/veterinary medicine's toxicity",
      ],
    },
    dosage: {
      type: String,
      required: [
        true,
        "Please provide the pesticide/veterinary medicine's dosage",
      ],
    },
    isolation: {
      type: String,
      required: [
        true,
        "Please provide the pesticide/veterinary medicine's isolation",
      ],
    },
    recommendation: {
      type: String,
      required: [
        true,
        "Please provide the pesticide/veterinary medicine's recommendation",
      ],
    },
    certificate: {
      type: String,
      required: [
        true,
        "Please provide the pesticide/veterinary medicine's certificate",
      ],
    },
    images: {
      type: [
        {
          path: String,
          filename: String,
        },
      ],
      required: [true, 'Please provide pesticide/veterinary medicine images'],
    },
  },
  { timestamps: true }
);

export default model<IMedicine>('Medicine', medicineSchema);
