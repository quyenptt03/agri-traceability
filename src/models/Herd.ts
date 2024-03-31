import { Schema, model, Types } from 'mongoose';

interface IHerd {
  name: string;
  category: Types.ObjectId;
  description: string;
  location: string;
  images: object[];
  farm: Types.ObjectId;
  member_count: number;
  start_date: Date;
  end_date: Date;
  records: object[];
  user: Types.ObjectId;
}

const HerdSchema = new Schema<IHerd>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide herd name'],
      maxLength: [100, 'Name can not be more than 100 characters'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      require: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide herd description'],
    },
    location: {
      type: String,
      required: [true, 'Please provide location of herd'],
    },
    images: {
      type: [
        {
          path: String,
          filename: String,
        },
      ],
      required: [true, 'Please provide herd images'],
    },
    member_count: {
      type: Number,
      default: 0,
    },
    farm: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      require: true,
    },
    start_date: {
      type: Date,
      default: Date.now,
    },
    end_date: {
      type: Date,
    },
    records: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Animal',
      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },

  { timestamps: true }
);

export default model<IHerd>('Herd', HerdSchema);
