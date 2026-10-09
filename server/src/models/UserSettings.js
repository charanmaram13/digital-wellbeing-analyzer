import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    dailyScreenTimeGoalMinutes: {
      type: Number,
      default: 360, // 6 hours
      min: [30, 'Goal must be at least 30 minutes'],
      max: [1440, 'Goal cannot exceed 1440 minutes'],
    },
    bedtime: {
      type: String,
      default: '23:00',
      match: [/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Bedtime must be HH:mm (24-hour)'],
    },
    wakeTime: {
      type: String,
      default: '07:00',
      match: [/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Wake time must be HH:mm (24-hour)'],
    },
    longSessionThresholdMinutes: {
      type: Number,
      default: 90, // 1.5 hours
      min: [15, 'Threshold must be at least 15 minutes'],
      max: [720, 'Threshold cannot exceed 720 minutes'],
    },
    lateNightThresholdMinutes: {
      type: Number,
      default: 45, // 45 minutes after bedtime
      min: [10, 'Threshold must be at least 10 minutes'],
      max: [360, 'Threshold cannot exceed 360 minutes'],
    },
    theme: {
      type: String,
      enum: ['dark', 'light', 'system'],
      default: 'dark',
    },
  },
  {
    timestamps: true,
  }
);

export const UserSettings = mongoose.model('UserSettings', userSettingsSchema);
export default UserSettings;
