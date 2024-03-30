import { Schema, model, Types } from 'mongoose';

interface IPatch {
  processor: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  description: string;
  production_date: Date;
  release_date: Date;
  images: object[];
  info: Types.ObjectId;
}

const patchSchema = new Schema<IPatch>(
  {
    processor: {
      type: Schema.Types.ObjectId,
      ref: 'Processor',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide the qty'],
      validate: {
        validator: function (v: number) {
          return v > 0;
        },
        message: (props) => `${props.value} is not a positive number!`,
      },
    },
    description: {
      type: String,
    },
    production_date: {
      type: Date,
      default: Date.now,
    },
    release_date: {
      type: Date,
      required: [true, 'Please provide release date'],
    },
    images: {
      type: [
        {
          path: String,
          filename: String,
        },
      ],
      required: [true, "Please provide product patch's images"],
    },
    info: {
      type: Schema.Types.ObjectId,
      ref: 'TraceabilityInfo',
    },
  },
  { timestamps: true }
);

export default model<IPatch>('ProductPatch', patchSchema);
