import { Schema, Types, model } from 'mongoose';

interface ICultivationLog {
  livestock: Types.ObjectId;
  herd: Types.ObjectId;
  name: string;
  description: string;
  notes?: string;
  images: object[];
  date: Date;
}

const cultivationLogSchema = new Schema<ICultivationLog>({
  livestock: {
    type: Schema.Types.ObjectId,
    ref: 'Livestock',
  },
  herd: {
    type: Schema.Types.ObjectId,
    ref: 'Herd',
  },
  name: {
    type: String,
    required: [true, "Please provide cultivation log's name"],
  },
  description: {
    type: String,
    required: [true, "Please provide cultivation log's description"],
  },
  notes: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  images: {
    type: [
      {
        path: String,
        filename: String,
      },
    ],
    required: [true, 'Please provide cultivation log images'],
  },
});

export default model<ICultivationLog>('CultivationLog', cultivationLogSchema);
