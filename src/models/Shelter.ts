import { Schema, model, Types } from 'mongoose';

interface IShelter {
  room: Types.ObjectId;
  cameraId: String;
}

const shelterSchema = new Schema<IShelter>({
  room: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Please enter room id'],
  },
  cameraId: {
    type: 'String',
    required: [true, 'Please enter camera id'],
  },
});

export default model<IShelter>('Shelter', shelterSchema);
