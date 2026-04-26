import { Router, Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Team } from '../models/Team';
import { User } from '../models/User';
import { Task } from '../models/Task';
import { protect, AuthRequest } from '../middleware/auth';
import { sendTeamInviteEmail } from '../config/mailer';

const router = Router();

// ── GET /api/teams/my ──────────────────────────────────────
router.get('/my', protect, async (req: AuthRequest, res: Response) => {
  try {
    let team = await Team.findOne({
      $or: [{ owner: req.userId }, { 'members.user': req.userId }]
    }).populate('members.user', 'name email avatar isVerified');

    if (!team) {
      const user = await User.findById(req.userId);
      team = await Team.create({
        name: `${user?.name}'s Team`,
        owner: req.userId,
        members: [{ user: req.userId, role: 'admin' }],
      });
      await team.populate('members.user', 'name email avatar isVerified');
    }

    const memberIds = team.members.map((m: any) => m.user._id || m.user);
    const taskStats = await Promise.all(memberIds.map(async (uid: any) => {
      const active    = await Task.countDocuments({ owner: uid, deletedAt: null, status: { $ne: 'done' } });
      const completed = await Task.countDocuments({ owner: uid, deletedAt: null, status: 'done' });
      return { userId: String(uid), active, completed };
    }));

    const totalTasks = await Task.countDocuments({ owner: { $in: memberIds }, deletedAt: null });
    const overdueTasks = await Task.countDocuments({
      owner: { $in: memberIds }, deletedAt: null,
      dueDate: { $lt: new Date() }, status: { $ne: 'done' }
    });

    res.json({ team, taskStats, totalTasks, overdueTasks });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/teams/my — rename team ─────────────────────
router.patch('/my', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name required' });
    const team = await Team.findOneAndUpdate(
      { owner: req.userId },
      { name: name.trim() },
      { new: true }
    ).populate('members.user', 'name email avatar');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/teams/my/invite ──────────────────────────────
router.post('/my/invite', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { email, role = 'member' } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const team = await Team.findOne({
      $or: [{ owner: req.userId }, { 'members.user': req.userId }]
    });
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Check if already a member
    const invitedUser = await User.findOne({ email: email.toLowerCase() });
    if (invitedUser) {
      const alreadyMember = team.members.some((m: any) => String(m.user) === String(invitedUser._id));
      if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

      // Add directly if they have an account
      team.members.push({ user: invitedUser._id as any, role, joinedAt: new Date() });
      await team.save();
      await team.populate('members.user', 'name email avatar');

      // Send notification email
      const inviter = await User.findById(req.userId);
      sendTeamInviteEmail(email, inviter?.name || 'Someone', team.name, '').catch(console.error);

      // Notify the added user
      await User.findByIdAndUpdate(invitedUser._id, {
        $push: {
          notifications: {
            type: 'invite_received',
            message: `${inviter?.name || 'Someone'} added you to the team "${team.name}"`,
            read: false,
            createdAt: new Date(),
          },
        },
      });

      return res.json({ message: `${invitedUser.name} added to the team`, team });
    }

    // User doesn't have an account — send invite with token
    const token = uuidv4();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Remove any existing invite for this email
    team.invites = team.invites.filter((i: any) => i.email !== email.toLowerCase()) as any;
    team.invites.push({ email: email.toLowerCase(), role, token, createdAt: new Date() });
    await team.save();

    const inviter = await User.findById(req.userId);
    await sendTeamInviteEmail(email, inviter?.name || 'Someone', team.name, token);

    res.json({ message: `Invitation sent to ${email}` });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/teams/accept-invite?token=xxx ─────────────────
// Called when invited user clicks the email link
router.get('/accept-invite', async (req: Request, res: Response) => {
  try {
    const token = req.query['token'] as string;
    if (!token) return res.status(400).json({ message: 'Token required' });

    const team = await Team.findOne({ 'invites.token': token });
    if (!team) return res.status(400).json({ message: 'Invalid or expired invite' });

    const invite = team.invites.find((i: any) => i.token === token);
    if (!invite) return res.status(400).json({ message: 'Invite not found' });

    // Return invite info so frontend can show register/login prompt
    res.json({
      teamName: team.name,
      email: invite.email,
      role: invite.role,
      token,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/teams/accept-invite ─────────────────────────
// Called after user registers/logs in with the invited email
router.post('/accept-invite', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });

    const team = await Team.findOne({ 'invites.token': token });
    if (!team) return res.status(400).json({ message: 'Invalid or expired invite' });

    const invite = team.invites.find((i: any) => i.token === token);
    if (!invite) return res.status(400).json({ message: 'Invite not found' });

    // Verify the logged-in user's email matches the invite
    const user = await User.findById(req.userId);
    if (!user || user.email !== invite.email) {
      return res.status(403).json({ message: 'This invite was sent to a different email address' });
    }

    // Add to team
    const alreadyMember = team.members.some((m: any) => String(m.user) === String(req.userId));
    if (!alreadyMember) {
      team.members.push({ user: req.userId as any, role: invite.role, joinedAt: new Date() });
    }

    // Remove used invite
    team.invites = team.invites.filter((i: any) => i.token !== token) as any;
    await team.save();
    await team.populate('members.user', 'name email avatar');

    // Notify the team owner
    await User.findByIdAndUpdate(team.owner, {
      $push: {
        notifications: {
          type: 'invite_accepted',
          message: `${user.name} accepted your invite and joined "${team.name}"`,
          read: false,
          createdAt: new Date(),
        },
      },
    });

    res.json({ message: `Welcome to ${team.name}!`, team });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/teams/my/members/:userId/role ───────────────
router.patch('/my/members/:userId/role', protect, async (req: AuthRequest, res: Response) => {
  try {
    const team = await Team.findOne({
      $or: [{ owner: req.userId }, { 'members': { $elemMatch: { user: req.userId, role: 'admin' } } }]
    });
    if (!team) return res.status(404).json({ message: 'Team not found or insufficient permissions' });

    const member = team.members.find((m: any) => String(m.user) === req.params['userId']);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.role = req.body.role;
    await team.save();
    await team.populate('members.user', 'name email avatar');
    res.json(team);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/teams/my/members/:userId ───────────────────
router.delete('/my/members/:userId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const team = await Team.findOne({
      $or: [{ owner: req.userId }, { 'members': { $elemMatch: { user: req.userId, role: 'admin' } } }]
    });
    if (!team) return res.status(404).json({ message: 'Team not found or insufficient permissions' });

    // Can't remove the owner
    if (String(team.owner) === req.params['userId']) {
      return res.status(400).json({ message: 'Cannot remove the team owner' });
    }

    team.members = team.members.filter((m: any) => String(m.user) !== req.params['userId']) as any;
    await team.save();
    res.json({ message: 'Member removed' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/teams/my/invites/:token ────────────────────
router.delete('/my/invites/:token', protect, async (req: AuthRequest, res: Response) => {
  try {
    const team = await Team.findOne({ owner: req.userId });
    if (!team) return res.status(404).json({ message: 'Team not found' });
    team.invites = team.invites.filter((i: any) => i.token !== req.params['token']) as any;
    await team.save();
    res.json({ message: 'Invite cancelled' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
