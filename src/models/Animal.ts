import { Schema, model, Types } from 'mongoose';

interface IAnimal {
  name: string;
  // type: string;
  gender: string;
  birth_weight: number;
  birth_date: Date;
  is_harvested: boolean;
  herd: Types.ObjectId;
  images: object[];
  user: Types.ObjectId;
}

const animalSchema = new Schema<IAnimal>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide livestock name'],
      maxLength: [100, 'Name can not be more than 100 characters'],
    },
    // type: {
    //   type: String,
    //   required: [true, 'Please provide type of livestock'],
    //   maxLength: [100, 'Type can not be more than 100 characters'],
    // },
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female'],
        default: 'Male',
      },
    },
    birth_weight: {
      type: Number,
      default: 0,
    },
    birth_date: {
      type: Date,
      default: Date.now,
    },
    is_harvested: {
      type: Boolean,
      default: false,
    },
    herd: {
      type: Schema.Types.ObjectId,
      ref: 'Herd',
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
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },

  { timestamps: true }
);

animalSchema.statics.calculateMemberCount = async function (herdId: string) {
  const result = await this.aggregate([
    {
      $match: { herd: herdId },
    },
    {
      $group: {
        _id: null,
        member_count: { $sum: 1 },
      },
    },
  ]);
  try {
    // @ts-ignore
    await this.model('Herd').findOneAndUpdate(
      { _id: herdId },
      {
        member_count: result[0]?.member_count || 0,
      }
    );
  } catch (error) {
    console.log('Error: ', error);
  }
};

animalSchema.post('save', async function () {
  // @ts-ignore
  await this.constructor.calculateMemberCount(this.herd);
});

animalSchema.post('insertMany', async function (animals: IAnimal[]) {
  // @ts-ignore
  const herdId = animals[0]?.herd;
  // @ts-ignore
  await this.calculateMemberCount(herdId);
});

// @ts-ignore
animalSchema.post('deleteOne', { document: true }, async function () {
  // @ts-ignore
  await this.constructor.calculateMemberCount(this.herd);
});

animalSchema.post('deleteMany', async function () {
  // @ts-ignore
  const herdId = this._conditions.herd;
  //@ts-ignore
  await this.model.calculateMemberCount(herdId); // Access static method directly
});

export default model<IAnimal>('Animal', animalSchema);
