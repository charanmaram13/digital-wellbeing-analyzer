import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    goalType: {
      type: String,
      enum: ['daily_limit', 'category_limit', 'focus_minutes'],
      required: true,
    },
    category: {
      type: String,
      default: null,
      enum: [
        null,
        'Social',
        'Entertainment',
        'Productivity',
        'Gaming',
        'Communication',
        'Utilities',
        'Other',
      ],
    },
    targetValue: {
      type: Number,
      required: [true, 'Target value is required'],
      min: [1, 'Target value must be at least 1 minute'],
    },
    startDate: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'],
    },
    endDate: {
      type: String,
      default: null,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'],
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ userId: 1, status: 1 });

export const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
