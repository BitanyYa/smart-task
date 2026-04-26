import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

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
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

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
