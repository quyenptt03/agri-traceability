import { Schema, model, Types } from 'mongoose';

interface IShelter {
  farm: Types.ObjectId;
  cameraId: String;
}

const shelterSchema = new Schema<IShelter>({
  farm: {
    type: Schema.Types.ObjectId,
    ref: 'Farm',
    required: [true, 'Please enter farm id'],
  },
  cameraId: {
    type: 'String',
    required: [true, 'Please enter camera id'],
  },
});

export default model<IShelter>('Shelter', shelterSchema);
