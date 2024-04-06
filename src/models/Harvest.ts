import { Schema, model, Types } from 'mongoose';

interface IHarvest {
  herd: Types.ObjectId;
  name: string;
  quantity: number;
  unit: string;
  date: Date;
  description: string;
  grade: string;
  isProcessed: boolean;
  images: object[];
}

const harvestSchema = new Schema<IHarvest>(
  {
    herd: {
      type: Schema.Types.ObjectId,
      ref: 'Herd',
    },
    name: {
      type: String,
      required: [true, 'Please provide the name of harvest'],
      maxLength: [100, 'Name can not be more than 100 characters'],
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
    unit: {
      type: String,
      required: [true, 'Please provide the unit of the harvest'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
    },
    grade: {
      type: String,
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [
        {
          path: String,
          filename: String,
        },
      ],
      required: [true, 'Please provide harvest images'],
    },
  },
  { timestamps: true }
);

export default model<IHarvest>('Harvest', harvestSchema);
