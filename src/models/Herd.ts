import { Schema, model, Types } from 'mongoose';
import { Observer } from 'services/harvest-service';
import { Notification, User } from './';

interface IHerd {
  name: string;
  category: Types.ObjectId;
  description: string;
  location: string;
  images: object[];
  farm: Types.ObjectId;
  member_count: number;
  start_date: Date;
  end_date: Date;
  records: object[];
  status: string;
  user: Types.ObjectId;
  notified: boolean;
  registerObserver(observer: Observer): void;
  removeObserver(observer: Observer): void;
  notifyObservers(): void;
  checkHarvestStatus(): void;
}

const HerdSchema = new Schema<IHerd>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide herd name'],
      maxLength: [100, 'Name can not be more than 100 characters'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      require: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide herd description'],
    },
    location: {
      type: String,
      required: [true, 'Please provide location of herd'],
    },
    images: {
      type: [
        {
          path: String,
          filename: String,
        },
      ],
      required: [true, 'Please provide herd images'],
    },
    member_count: {
      type: Number,
      default: 0,
    },
    farm: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      require: true,
    },
    start_date: {
      type: Date,
      default: Date.now,
    },
    end_date: {
      type: Date,
    },
    records: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Animal',
      },
    ],
    status: {
      type: String,
      enum: {
        values: ['Chưa thu hoạch', 'Đang thu hoạch', 'Thu hoạch xong'],
      },
      default: 'Chưa thu hoạch',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notified: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

HerdSchema.methods.registerObserver = function (observer: Observer): void {
  if (!this.observers) {
    this.observers = [];
  }
  this.observers.push(observer);
};

HerdSchema.methods.removeObserver = function (observer: Observer): void {
  this.observers = this.observers.filter((o: Observer) => o !== observer);
};

HerdSchema.methods.notifyObservers = async function (): Promise<void> {
  const message = `Herd ${this.name} has reached the harvest age.`;
  this.observers.forEach((observer: Observer) => observer.update(message));

  // const notification = new Notification({
  //   user: this.user,
  //   message,
  // });
  // notification.save();
  try {
    const users = await User.find();
    users.forEach((user) => {
      const notification = new Notification({
        user: user._id,
        message,
      });
      notification.save().catch((err) => {
        console.error('Error saving notification:', err);
      });
    });
  } catch (err) {
    console.error('Error fetching users:', err);
  }
};

HerdSchema.methods.checkHarvestStatus = function (): void {
  const age = new Date().valueOf() - this.start_date;
  const six_month = 1000 * 60 * 60 * 24 * 30 * 6;
  if (this.status === 'Chưa thu hoạch') {
    this.notified = true;
    this.notifyObservers();
    this.save();
  }
};

export default model<IHerd>('Herd', HerdSchema);
