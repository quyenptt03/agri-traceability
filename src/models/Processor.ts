import { Schema, model, Types } from 'mongoose';

interface IProcessor {
  name: string;
  harvest: Types.ObjectId;
  location: string;
  description: string;
  date: Date;
  images: object[];
}

const processorSchema = new Schema<IProcessor>(
  {
    name: {
      type: String,
      required: [true, 'Please provide the name of processor'],
      maxLength: [100, 'Name can not be more than 100 characters'],
    },
    harvest: {
      type: Schema.Types.ObjectId,
      ref: 'Harvest',
      required: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide the location of processor'],
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    images: {
      type: [
        {
          path: String,
          filename: String,
        },
      ],
      required: [true, 'Please provide processor images'],
    },
  },
  { timestamps: true }
);

export default model<IProcessor>('Processor', processorSchema);
