import mongoose, { Document, Schema, Types } from 'mongoose';

export type Priority = 'low' | 'medium' | 'high';
export type Status   = 'todo' | 'inprogress' | 'done';

export interface IComment {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IActivityLog {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  action: string;
  createdAt: Date;
}

export interface ITimeEntry {
  startedAt: Date;
  stoppedAt?: Date;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  owner: Types.ObjectId;
  labels: string[];
  dueDate?: Date;
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly';
  comments: IComment[];
  activityLog: IActivityLog[];
  timeEntries: ITimeEntry[];
  isTimerRunning: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  user:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text:      { type: String, required: true, trim: true },
}, { timestamps: true });

const ActivitySchema = new Schema<IActivityLog>({
  user:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
}, { timestamps: true });

const TimeEntrySchema = new Schema<ITimeEntry>({
  startedAt:  { type: Date, required: true },
  stoppedAt:  { type: Date },
});

const TaskSchema = new Schema<ITask>({
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  status:      { type: String, enum: ['todo','inprogress','done'], default: 'todo' },
  priority:    { type: String, enum: ['low','medium','high'], default: 'medium' },
  owner:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  labels:      [{ type: String, trim: true }],
  dueDate:     { type: Date },
  isRecurring: { type: Boolean, default: false },
  recurringInterval: { type: String, enum: ['daily','weekly','monthly'] },
  comments:    [CommentSchema],
  activityLog: [ActivitySchema],
  timeEntries: [TimeEntrySchema],
  isTimerRunning: { type: Boolean, default: false },
  deletedAt:   { type: Date, default: null },
}, { timestamps: true });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
