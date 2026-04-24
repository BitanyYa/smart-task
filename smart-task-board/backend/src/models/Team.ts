import mongoose, { Document, Schema, Types } from 'mongoose';

export type TeamRole = 'admin' | 'member' | 'guest';

export interface ITeamMember {
  user: Types.ObjectId;
  role: TeamRole;
  joinedAt: Date;
}

export interface ITeam extends Document {
  name: string;
  owner: Types.ObjectId;
  members: ITeamMember[];
  invites: { email: string; role: TeamRole; token: string; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>({
  name:  { type: String, required: true, trim: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user:     { type: Schema.Types.ObjectId, ref: 'User' },
    role:     { type: String, enum: ['admin', 'member', 'guest'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  }],
  invites: [{
    email:     { type: String },
    role:      { type: String, enum: ['admin', 'member', 'guest'], default: 'member' },
    token:     { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

export const Team = mongoose.model<ITeam>('Team', TeamSchema);
