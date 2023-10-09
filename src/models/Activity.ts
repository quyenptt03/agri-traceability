import { Schema, model, Types } from 'mongoose';

interface IActivity {
  name: string;
  description: string;
  amount: number;
  unit: string;
}

const ActivitySchema = new Schema<IActivity>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide activity name'],
      maxLength: [100, 'Name can not be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide activity description'],
    },
    amount: {
      type: Number,
    },
    unit: {
      type: String,
    },
  },
  { timestamps: true }
);

export default model<IActivity>('Activity', ActivitySchema);
