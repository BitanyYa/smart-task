import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface INotification {
  _id?: string;
  type: 'invite_accepted' | 'invite_received' | 'general';
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  isVerified: boolean;
  verificationToken?: string | null;
  verificationExpires?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  notifications: INotification[];
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const NotificationSchema = new Schema({
  type:      { type: String, enum: ['invite_accepted', 'invite_received', 'general'], required: true },
  message:   { type: String, required: true },
  read:      { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const UserSchema = new Schema<IUser>({
  name:                   { type: String, required: true, trim: true },
  email:                  { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:               { type: String, required: true, minlength: 6 },
  avatar:                 { type: String },
  isVerified:             { type: Boolean, default: false },
  verificationToken:      { type: String, default: null },
  verificationExpires:    { type: Date, default: null },
  resetPasswordToken:     { type: String, default: null },
  resetPasswordExpires:   { type: Date, default: null },
  notifications:          { type: [NotificationSchema], default: [] },
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

// Never return password in JSON
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { password: _p, ...rest } = ret;
    return rest;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
