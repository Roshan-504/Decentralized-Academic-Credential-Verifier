import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    program: {
      type: String,
      required: true,
      enum: ['B.Tech', 'MCA', 'Pharmacy', 'Architecture', 'Management'],
    },
    batch: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    institute: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
      default: '',
    },
    blockchainTxHash: {
      type: String,
      default: '',
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;