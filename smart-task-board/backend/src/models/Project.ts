import mongoose, { Document, Schema, Types } from 'mongoose';

export type ProjectStatus = 'active' | 'on-hold' | 'completed';

export interface IProject extends Document {
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  dueDate?: Date;
  pinned: boolean;
  iconBg: string;
  accentColor: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  status:      { type: String, enum: ['active','on-hold','completed'], default: 'active' },
  progress:    { type: Number, default: 0, min: 0, max: 100 },
  owner:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members:     [{ type: Schema.Types.ObjectId, ref: 'User' }],
  dueDate:     { type: Date },
  pinned:      { type: Boolean, default: false },
  iconBg:      { type: String, default: 'bg-primary-100' },
  accentColor: { type: String, default: 'border-l-primary-500' },
}, { timestamps: true });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
