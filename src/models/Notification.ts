import { Schema, model, Document, Types } from 'mongoose';

interface INotification extends Document {
  user: Types.ObjectId;
  message: string;
  read: boolean;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default model<INotification>('Notification', NotificationSchema);
