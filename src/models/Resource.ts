import { Schema, model, Types, Date } from 'mongoose';

interface IResource {
  name: string;
  quantity: number;
  remain_qty: number;
  use_date: Date;
  usage: string;
  received_date: Date;
}

const resourceSchema = new Schema<IResource>({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please provide resource name'],
    maxLength: [500, 'Name can not be more than 500 characters'],
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity of resource'],
  },
  remain_qty: {
    type: Number,
  },
  use_date: {
    type: Date,
  },
  usage: {
    type: String,
  },
  received_date: {
    type: Date,
  },
});

export default model<IResource>('Resource', resourceSchema);
