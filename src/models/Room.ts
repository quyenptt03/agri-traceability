import { Schema, model } from 'mongoose';

interface IRoom {
  name: string;
  description: string;
  area: number;
  address: string;
  roomList: string[];
  coordinates: [number, number];
  images: object[];
}

const roomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide room name'],
      maxlength: [4, 'The length of name is 4'],
      minlength: [4, 'The length of name is 4'],
    },
    description: {
      type: String,
    },
    area: {
      type: Number,
    },
    coordinates: {
      type: [Number, Number],
    },
    images: {
      type: [
        {
          path: String,
          filename: String,
        },
      ],
    },
  },
  { timestamps: true }
);

export default model<IRoom>('Room', roomSchema);
