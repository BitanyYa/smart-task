import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';

const router = Router();

// GET /api/notifications — fetch current user's notifications
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('notifications');
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Return newest first
    const sorted = [...user.notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(sorted);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', protect, async (req: AuthRequest, res: Response) => {
  try {
    await User.updateOne(
      { _id: req.userId },
      { $set: { 'notifications.$[].read': true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/:id/read — mark single as read
router.patch('/:id/read', protect, async (req: AuthRequest, res: Response) => {
  try {
    await User.updateOne(
      { _id: req.userId, 'notifications._id': req.params.id },
      { $set: { 'notifications.$.read': true } }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/notifications/:id — delete a notification
router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    await User.updateOne(
      { _id: req.userId },
      { $pull: { notifications: { _id: req.params.id } } }
    );
    res.json({ message: 'Notification deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
