import { Schema, Types, model } from 'mongoose';

interface ICultivationLog {
  animal: Types.ObjectId;
  herd: Types.ObjectId;
  name: string;
  description: string;
  notes?: string;
  mediaUri: object[];
  date: Date;
  shelter: Types.ObjectId;
}

const cultivationLogSchema = new Schema<ICultivationLog>({
  animal: {
    type: Schema.Types.ObjectId,
    ref: 'Animal',
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
  },
  notes: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  mediaUri: {
    type: [
      {
        path: String,
        filename: String,
      },
    ],
    required: [true, 'Please provide cultivation log images'],
  },
  shelter: {
    type: Schema.Types.ObjectId,
    ref: 'Shelter',
  },
});

export default model<ICultivationLog>('CultivationLog', cultivationLogSchema);
