import { Schema, model, Types } from 'mongoose';

interface IInfo {
  product: Types.ObjectId;
  herd: Types.ObjectId;
  harvest: Types.ObjectId;
  processor: Types.ObjectId;
  distributor: Types.ObjectId;
}

const infoSchema = new Schema<IInfo>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    herd: {
      type: Schema.Types.ObjectId,
      ref: 'Herd',
      required: true,
    },
    harvest: {
      type: Schema.Types.ObjectId,
      ref: 'Harvest',
    },
    processor: {
      type: Schema.Types.ObjectId,
      ref: 'Processor',
    },
    distributor: {
      type: Schema.Types.ObjectId,
      ref: 'Distributor',
    },
  },

  { timestamps: true }
);

export default model<IInfo>('TraceabilityInfo', infoSchema);
