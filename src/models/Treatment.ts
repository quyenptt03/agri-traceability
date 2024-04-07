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
        'Thụ tinh nhân tạo (Alternative Therapy)',
        'Thiến (Castration)',
        'Khử sừng (Dehorning)',
        'Nha khoa (Dental Procedure)',
        'Tẩy giun (Deworming)',
        'Bấm lỗ tai (Ear Notching)',
        'An tử (Euthanasia)',
        'Chải chuốt (Grooming)',
        'Cắt móng (Hoof Trim)',
        'Thuốc (Medication)',
        'Ve (Mites)',
        'Điều trị ký sinh trùng (Parasite Treatment)',
        'Phẫu thuật (Surgical Procedure)',
        'Gắn thẻ (Tagging)',
        'Xăm hình (Tattoo)',
        'Tiêm chủng (Vaccination)',
        'Khác (Other Procedure)',
      ],
    },
  },
  product: {
    type: String,
    trim: true,
    required: [true, 'Please provide products to treat'],
  },
  amount: {
    type: String,
  },
  mode: {
    type: String,
    enum: {
      values: [
        'Tiêm bắp (trong cơ)',
        'Intrammary (trong bầu vú)',
        'Trong tử cung',
        'Tiêm tĩnh mạch',
        'Miệng (trong miệng)',
        'Tiêm dưới da',
        'Bôi ngoài (trên da)',
        'Khác',
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
    // enum: {
    //   values: [
    //     'Mông', 'Sườn', 'Cổ', 'Khác'],
    // },
  },
  technician: {
    type: String,
  },
});

export default model<ITreatment>('Treatment', treatmentSchema);
