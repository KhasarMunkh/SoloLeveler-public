import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/*
 * Profile.ts
 * -------------------------
 * Stores gameplay and personalization data for each user.
 * Linked to User model via userId (ObjectId reference).
 *
 * Contains user stats (XP, level), bio, avatar, and customization preferences.
 * This collection separates game state from authentication data to keep the `User` model lightweight.
 */

export interface IProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;  // Reference to User._id
  level: number;
  xp: number;
  avatarUrl?: string;
  bio?: string;
  age?: number;
  gender?: string;
  username?: string;  // Optional display name
  preferences: {
    darkMode: boolean;
    notificationsEnabled: boolean;
  };
  customization: {
    theme: string;
    title: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,  // One profile per user
      index: true,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    avatarUrl: {
      type: String,
      required: false,
    },
    bio: {
      type: String,
      required: false,
      maxlength: 500,
    },
    age: {
      type: Number,
      required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      required: false,
    },
    preferences: {
      darkMode: {
        type: Boolean,
        default: false,
      },
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
    },
    customization: {
      theme: {
        type: String,
        default: 'default',
      },
      title: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,  // Automatically adds createdAt and updatedAt
  }
);

// Note: unique: true on userId already creates an index, so no need for manual index creation

// Prevent model recompilation during hot reloads
const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile;
