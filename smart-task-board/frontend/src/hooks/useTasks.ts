import { useState, useEffect, useCallback } from 'react';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/tasks';

export const useTasks = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trashed, setTrashed] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [active, trash] = await Promise.all([
        api.fetchTasks(token),
        api.fetchTrashed(token),
      ]);
      setTasks(active);
      setTrashed(trash);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const addTask = async (dto: CreateTaskDto) => {
    const task = await api.createTask(token!, dto);
    setTasks(prev => [task, ...prev]);
  };

  const editTask = async (id: string, dto: UpdateTaskDto) => {
    const updated = await api.updateTask(token!, id, dto);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
  };

  const removeTask = async (id: string) => {
    const deleted = await api.softDeleteTask(token!, id);
    setTasks(prev => prev.filter(t => t.id !== id));
    setTrashed(prev => [deleted, ...prev]);
  };

  const restoreTask = async (id: string) => {
    const restored = await api.restoreTask(token!, id);
    setTrashed(prev => prev.filter(t => t.id !== id));
    setTasks(prev => [restored, ...prev]);
  };

  const permanentDelete = async (id: string) => {
    await api.hardDeleteTask(token!, id);
    setTrashed(prev => prev.filter(t => t.id !== id));
  };

  const toggleTimer = async (task: Task) => {
    const updated = task.isTimerRunning
      ? await api.stopTimer(token!, task.id)
      : await api.startTimer(token!, task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
  };

  const addComment = async (taskId: string, text: string) => {
    const comment = await api.addComment(token!, taskId, text);
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t
    ));
  };

  const deleteComment = async (taskId: string, commentId: string) => {
    await api.deleteComment(token!, taskId, commentId);
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, comments: t.comments.filter(c => c._id !== commentId) }
        : t
    ));
  };

  return {
    tasks, trashed, loading, error,
    addTask, editTask, removeTask, restoreTask, permanentDelete,
    toggleTimer, addComment, deleteComment,
  };
};
