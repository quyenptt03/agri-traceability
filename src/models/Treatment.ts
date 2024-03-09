import { Schema, Types, model } from 'mongoose';

interface ITreatment {
  livestock: Types.ObjectId;
  herd: Types.ObjectId;
  disease: Types.ObjectId;
  type: string;
  product: String;
  amount: String;
  mode: string;
  description: string;
  date: Date;
  retreat_date: Date;
  site: String;
  technician: String;
}

const treatmentSchema = new Schema<ITreatment>({
  livestock: {
    type: Schema.Types.ObjectId,
    ref: 'Livestock',
  },
  herd: {
    type: Schema.Types.ObjectId,
    ref: 'Herd',
  },
  disease: {
    type: Schema.Types.ObjectId,
    ref: 'Disease',
  },
  type: {
    type: String,
    required: [true, 'Please provide type of treatment'],
    enum: {
      values: [
        'Alternative Therapy',
        'Artificial Insemination',
        'Branding',
        'Castration',
        'Dehorning',
        'Dental Procedure',
        'Deworming',
        'Ear Notching',
        'Euthanasia',
        'Grooming',
        'Hoof Trim',
        'Medication',
        'Mites',
        'Parasite Treatment',
        'Surgical Procedure',
        'Tagging',
        'Tattoo',
        'Vaccination',
        'Other Procedure',
      ],
    },
  },
  product: {
    type: String,
    trim: true,
  },
  amount: {
    type: String,
  },
  mode: {
    type: String,
    enum: {
      values: [
        'Intramuscular (in the muscle)',
        'Intramammary (in the udder)',
        'Intrauterine (in the uterus)',
        'Intravenous (in the vein)',
        'Oral (in the mouth)',
        'Subcutaneous (under the skin)',
        'Topical (on the skin)',
        'Other',
      ],
    },
  },
  description: {
    type: String,
    required: [true, 'Please provide treatment description'],
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  retreat_date: {
    type: Date,
  },
  site: {
    type: String,
    enum: {
      values: ['Rump', 'Flank', 'Neck', 'Other'],
    },
  },
  technician: {
    type: String,
  },
});

export default model<ITreatment>('Treatment', treatmentSchema);
