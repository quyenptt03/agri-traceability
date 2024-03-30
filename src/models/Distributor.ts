import { Schema, model, Types } from 'mongoose';

interface IDistributor {
  warehouse_name: string;
  warehouse_address: string;
  images: object[];
  received_date: Date;
  delivery_date: Date;
  stores: string;
  product_patch: Types.ObjectId;
}

const distributorSchema = new Schema<IDistributor>(
  {
    warehouse_name: {
      type: String,
      required: [true, 'Please provide the warehouse name'],
      maxLength: [100, 'Name can not be more than 100 characters'],
    },
    warehouse_address: {
      type: String,
      required: [true, 'Please provide the warehouse address'],
      maxlength: [500, 'Warehouse address can not be more than 500 characters'],
    },
    images: {
      type: [
        {
          path: String,
          filename: String,
        },
      ],
      required: [true, 'Please provide distributor images'],
    },
    received_date: {
      type: Date,
      default: Date.now,
    },
    delivery_date: {
      type: Date,
    },
    stores: {
      type: String,
      required: [true, 'Please provide the stores to distribute'],
    },
    product_patch: {
      type: Schema.Types.ObjectId,
      ref: 'ProductPatch',
    },
  },
  { timestamps: true }
);

export default model<IDistributor>('Distributor', distributorSchema);
