import { Schema, model, Types } from 'mongoose';

interface IProcessor {
  name: string;
  price: number;
  currency_unit: string;
  net_weight: number;
  unit: string;
  dte: string;
  production_date: Date;
  description: string;
  harvest: Types.ObjectId;
  location: string;
  quantity: number;
  product_info: Types.ObjectId;
  images: object[];
  info: Types.ObjectId;
  qr_code: string;
}

const processorSchema = new Schema<IProcessor>(
  {
    price: {
      type: Number,
      required: [true, 'Please provide the price'],
      validate: {
        validator: function (v: number) {
          return v > 0;
        },
        message: (props) => `${props.value} is not a positive number!`,
      },
    },
    currency_unit: {
      type: String,
      default: 'VND',
    },
    net_weight: {
      type: Number,
      required: [true, 'Please provide the net weight of product'],
      validate: {
        validator: function (v: number) {
          return v > 0;
        },
        message: (props) => `${props.value} is not a positive number!`,
      },
    },
    unit: {
      type: String,
      required: [true, 'Please provide the unit'],
    },
    dte: {
      type: String,
      required: [true, 'Please provide the days to expiry'],
    },
    description: {
      type: String,
    },
    production_date: {
      type: Date,
      default: Date.now,
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
    product_info: {
      type: Schema.Types.ObjectId,
      ref: 'ProductInfo',
      require: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide the quantity'],
      validate: {
        validator: function (v: number) {
          return v > 0;
        },
        message: (props) => `${props.value} is not a positive number!`,
      },
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
    info: {
      type: Schema.Types.ObjectId,
      ref: 'TraceabilityInfo',
    },
    qr_code: {
      type: String,
    },
  },

  { timestamps: true }
);

export default model<IProcessor>('Processor', processorSchema);
