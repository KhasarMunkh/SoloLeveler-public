import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/*
 * Progress.ts
 * -------------------------
 * Tracks user productivity and progression over time.
 * Linked to User model via userId (ObjectId reference).
 * Aggregates daily and streak-based stats.
 *
 * Useful for generating analytics, streak tracking,
 * and building progress charts or insights in the app.
 */

export interface IProgress extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;  // Reference to User._id
  date: Date;              // Date for this progress entry (start of day)
  questsCompleted: number; // Tasks completed on this date
  xpEarned: number;        // XP earned on this date (renamed from totalXP for clarity)
  streak: number;          // Streak count as of this date
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    questsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    xpEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,  // Automatically adds createdAt and updatedAt
  }
);

// Compound index for efficient queries (user's progress over time)
ProgressSchema.index({ userId: 1, date: -1 });

// Ensure one progress entry per user per day
ProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

// Prevent model recompilation during hot reloads
const Progress: Model<IProgress> = mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);

export default Progress;
