import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['routine', 'boundary', 'focus', 'app_limit', 'bedtime_habit'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    triggeringPattern: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'dismissed', 'snoozed'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

recommendationSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const Recommendation = mongoose.model('Recommendation', recommendationSchema);
export default Recommendation;
