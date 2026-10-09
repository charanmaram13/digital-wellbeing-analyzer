import mongoose from 'mongoose';

const screenTimeRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    applicationName: {
      type: String,
      required: [true, 'Application name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Social',
        'Entertainment',
        'Productivity',
        'Gaming',
        'Communication',
        'Utilities',
        'Other',
      ],
      default: 'Other',
    },
    date: {
      type: String,
      required: [true, 'Date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
      index: true,
    },
    startTime: {
      type: String,
      trim: true,
      default: null,
      match: [/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Start time must be HH:mm (24-hour)'],
    },
    endTime: {
      type: String,
      trim: true,
      default: null,
      match: [/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'End time must be HH:mm (24-hour)'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [1440, 'Duration cannot exceed 1440 minutes'],
    },
    sessionCount: {
      type: Number,
      default: 1,
      min: [1, 'Session count must be at least 1'],
    },
    source: {
      type: String,
      enum: ['manual', 'CSV', 'demo'],
      default: 'manual',
    },
    deviceIdentifier: {
      type: String,
      trim: true,
      default: 'Primary Device',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user queries and duplicate prevention
screenTimeRecordSchema.index({ userId: 1, date: -1 });
screenTimeRecordSchema.index({ userId: 1, category: 1 });
screenTimeRecordSchema.index(
  { userId: 1, date: 1, applicationName: 1, startTime: 1 },
  { unique: false }
);

export const ScreenTimeRecord = mongoose.model('ScreenTimeRecord', screenTimeRecordSchema);
export default ScreenTimeRecord;
