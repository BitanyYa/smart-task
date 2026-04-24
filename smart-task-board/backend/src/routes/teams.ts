import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Team } from '../models/Team';
import { User } from '../models/User';
import { Task } from '../models/Task';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(protect);

// GET /api/teams/my — get or create the user's team
router.get('/my', async (req: AuthRequest, res: Response) => {
  try {
    let team = await Team.findOne({
      $or: [{ owner: req.userId }, { 'members.user': req.userId }]
    }).populate('members.user', 'name email avatar');

    if (!team) {
      // Auto-create a team for the user
      const user = await User.findById(req.userId);
      team = await Team.create({
        name: `${user?.name}'s Team`,
        owner: req.userId,
        members: [{ user: req.userId, role: 'admin' }],
      });
      await team.populate('members.user', 'name email avatar');
    }

    // Enrich members with task stats
    const memberIds = team.members.map(m => m.user._id || m.user);
    const taskStats = await Promise.all(memberIds.map(async (uid) => {
      const active = await Task.countDocuments({ owner: uid, deletedAt: null, status: { $ne: 'done' } });
      const completed = await Task.countDocuments({ owner: uid, deletedAt: null, status: 'done' });
      return { userId: String(uid), active, completed };
    }));

    const totalTasks = await Task.countDocuments({
      owner: { $in: memberIds }, deletedAt: null
    });
    const overdueTasks = await Task.countDocuments({
      owner: { $in: memberIds }, deletedAt: null,
      dueDate: { $lt: new Date() }, status: { $ne: 'done' }
    });

    res.json({ team, taskStats, totalTasks, overdueTasks });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/teams/my/members/:userId/role
router.patch('/my/members/:userId/role', async (req: AuthRequest, res: Response) => {
  try {
    const team = await Team.findOne({ owner: req.userId });
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const member = team.members.find(m => String(m.user) === req.params.userId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.role = req.body.role;
    await team.save();
    await team.populate('members.user', 'name email avatar');
    res.json(team);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/teams/my/members/:userId
router.delete('/my/members/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const team = await Team.findOne({ owner: req.userId });
    if (!team) return res.status(404).json({ message: 'Team not found' });

    team.members = team.members.filter(m => String(m.user) !== req.params.userId) as any;
    await team.save();
    res.json({ message: 'Member removed' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/teams/my/invite — invite by email
router.post('/my/invite', async (req: AuthRequest, res: Response) => {
  try {
    const { email, role = 'member' } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const team = await Team.findOne({ owner: req.userId });
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Check if user exists and add directly
    const invitedUser = await User.findOne({ email: email.toLowerCase() });
    if (invitedUser) {
      const alreadyMember = team.members.some(m => String(m.user) === String(invitedUser._id));
      if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

      team.members.push({ user: invitedUser._id as any, role, joinedAt: new Date() });
      await team.save();
      await team.populate('members.user', 'name email avatar');
      return res.json({ message: 'Member added', team });
    }

    // Store invite token for non-existing users
    const token = uuidv4();
    team.invites.push({ email: email.toLowerCase(), role, token, createdAt: new Date() });
    await team.save();

    res.json({ message: `Invite sent to ${email}`, token });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
