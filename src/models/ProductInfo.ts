import { Schema, Types, model } from 'mongoose';
interface IProductInfo {
  name: string;
  description: string;
  storage_method: string;
}

const productInfoSchema = new Schema<IProductInfo>({
  name: {
    type: String,
    trim: true,
    required: [true, "Please provide product's name"],
    maxLength: [100, 'Name can not be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide farm product description'],
  },
  storage_method: {
    type: String,
    maxLength: [500, 'Storage method can not be more than 500 characters'],
  },
});

export default model<IProductInfo>('ProductInfo', productInfoSchema);
