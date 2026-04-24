export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'inprogress' | 'done';

export type Task = {
  _id: string;
  id: string; // alias for _id for dnd-kit compatibility
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  labels: string[];
  dueDate?: string;
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly';
  comments: Comment[];
  activityLog: ActivityLog[];
  timeEntries: TimeEntry[];
  isTimerRunning: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  text: string;
  createdAt: string;
};

export type ActivityLog = {
  _id: string;
  user: { _id: string; name: string };
  action: string;
  createdAt: string;
};

export type TimeEntry = {
  startedAt: string;
  stoppedAt?: string;
};

export type CreateTaskDto = {
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  labels?: string[];
  dueDate?: string;
  isRecurring?: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly';
};

export type UpdateTaskDto = Partial<CreateTaskDto>;

export type User = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
};
