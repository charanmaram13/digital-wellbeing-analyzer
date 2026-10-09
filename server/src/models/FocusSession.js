import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plannedDurationMinutes: {
      type: Number,
      required: true,
      default: 25,
      min: [1, 'Planned duration must be at least 1 minute'],
    },
    actualDurationMinutes: {
      type: Number,
      default: 0,
      min: [0, 'Actual duration cannot be negative'],
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'cancelled'],
      default: 'in_progress',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

focusSessionSchema.index({ userId: 1, startedAt: -1 });

export const FocusSession = mongoose.model('FocusSession', focusSessionSchema);
export default FocusSession;
