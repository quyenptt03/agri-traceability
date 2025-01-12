import { Schema, model, Types } from 'mongoose';
import Herd from './Herd';

interface IAnimal {
  name: string;
  // type: string;
  gender: string;
  birth_weight: number;
  birth_date: Date;
  herd: Types.ObjectId;
  images: object[];
  user: Types.ObjectId;
  disease: Types.ObjectId;
}

const animalSchema = new Schema<IAnimal>({
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
  disease: {
    type: Schema.Types.ObjectId,
    ref: 'Disease',
  },
});

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
  await Herd.updateOne(
    { _id: this.herd },
    { $addToSet: { records: this._id } }
  );

  // @ts-ignore
  await this.constructor.calculateMemberCount(this.herd);
});

animalSchema.post('insertMany', async function (animals: IAnimal[]) {
  // @ts-ignore
  const herdId = animals[0]?.herd;

  await Herd.updateOne({ _id: herdId }, { $addToSet: { records: animals } });

  // @ts-ignore
  await this.calculateMemberCount(herdId);
});

animalSchema.pre('findOneAndUpdate', async function () {
  // Access the original document before the update
  //@ts-ignore
  this.herd = await this.model.findOne(this.getQuery());
});

animalSchema.post('findOneAndUpdate', async function (result) {
  // Access the original document before the update
  //@ts-ignore
  const original = this.herd;

  if (original && original.herd !== result.herd) {
    // Update the old herd
    await Herd.updateOne(
      { _id: original.herd },
      { $pull: { records: original._id } }
    );

    //@ts-ignore
    await this.model.calculateMemberCount(original.herd);

    // Update the new herd
    await Herd.updateOne(
      { _id: result.herd },
      { $addToSet: { records: result._id } }
    );

    //@ts-ignore
    await this.model.calculateMemberCount(result.herd);
  }
});

// @ts-ignore
animalSchema.post('deleteOne', { document: true }, async function () {
  //@ts-ignore
  await Herd.updateOne({ _id: this.herd }, { $pull: { records: this._id } });
  // @ts-ignore
  await this.constructor.calculateMemberCount(this.herd);
});

animalSchema.post('deleteMany', async function () {
  // @ts-ignore
  const herdId = this._conditions.herd;
  await Herd.updateOne({ id: herdId }, []);
  //@ts-ignore
  await this.model.calculateMemberCount(herdId);
});

export default model<IAnimal>('Animal', animalSchema);
