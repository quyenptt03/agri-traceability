import { Schema, model, Types } from 'mongoose';

interface IPest {
  name: string;
  category: Types.ObjectId;
  description: string;
  images: object[];
}

const pestSchema = new Schema<IPest>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide pest name'],
      maxLength: [100, 'Name can not be more than 100 characters'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'PestCategory',
      require: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide pest description'],
    },
    images: {
      type: [
        {
          path: String,
          filename: String,
        },
      ],
      required: [true, 'Please provide pest images'],
    },
  },
  { timestamps: true }
);

export default model<IPest>('Pest', pestSchema);
