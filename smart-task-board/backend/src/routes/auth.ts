import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { sendVerificationEmail, sendPasswordResetEmail } from '../config/mailer';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

const ACCESS_EXPIRES        = '15m';
const REFRESH_EXPIRES_DAYS  = 7;
const VERIFY_EXPIRES_HOURS  = 24;
const RESET_EXPIRES_HOURS   = 1;

const signAccess = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: ACCESS_EXPIRES } as jwt.SignOptions);

const createRefreshToken = async (userId: string) => {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ token, user: userId, expiresAt });
  return token;
};

// ── POST /api/auth/register ────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name:     z.string().min(2, "Name must be at least 2 characters"),
      email:    z.string().email("Please enter a valid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[Register] Attempting: ${normalizedEmail}`);
    
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      console.log(`[Register] Email already in use: ${normalizedEmail}`);
      return res.status(400).json({ message: 'Email already in use' });
    }

    const verificationToken   = uuidv4();
    const verificationExpires = new Date(Date.now() + VERIFY_EXPIRES_HOURS * 60 * 60 * 1000);

    console.log(`[Register] Creating user document...`);
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      verificationToken,
      verificationExpires,
      isVerified: false,
    });
    console.log(`[Register] User created: ${user._id}`);

    // Send verification email (non-blocking)
    sendVerificationEmail(normalizedEmail, name, verificationToken).catch(err =>
      console.error('[Register] Email send failed:', err.message)
    );

    console.log(`[Register] Generating tokens...`);
    const accessToken  = signAccess(String(user._id));
    const refreshToken = await createRefreshToken(String(user._id));
    console.log(`[Register] Success!`);

    res.status(201).json({
      token: accessToken,
      refreshToken,
      user,
      message: 'Account created. Please check your email to verify your account.',
    });
  } catch (err: any) {
    console.error('Register error details:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already exists in database.' });
    }
    res.status(500).json({ message: err.message || 'Server error during registration' });
  }
});

// ── POST /api/auth/login ───────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      email:    z.string().email("Please enter a valid email address"),
      password: z.string().min(1, "Password is required"),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      console.log(`[Login] Validation failed for:`, req.body.email, "Error:", parsed.error.issues[0].message);
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[Login] Attempting: ${normalizedEmail}`);
    
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`[Login] User not found: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`[Login] Password mismatch for: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken  = signAccess(String(user._id));
    const refreshToken = await createRefreshToken(String(user._id));

    res.json({
      token: accessToken,
      refreshToken,
      user,
      isVerified: user.isVerified,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// ── GET /api/auth/verify-email?token=xxx ──────────────────
router.get('/verify-email', async (req: Request, res: Response) => {
  const token = req.query['token'] as string | undefined;
  if (!token) return res.status(400).json({ message: 'Token required' });

  const user = await User.findOne({
    verificationToken: token,
    verificationExpires: { $gt: new Date() },
  } as any);

  if (!user) return res.status(400).json({ message: 'Invalid or expired verification link' });

  user.isVerified          = true;
  user.verificationToken   = null;
  user.verificationExpires = null;
  await user.save();

  res.json({ message: 'Email verified successfully! You can now use all features.' });
});

// ── POST /api/auth/resend-verification ────────────────────
router.post('/resend-verification', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

  const verificationToken   = uuidv4();
  const verificationExpires = new Date(Date.now() + VERIFY_EXPIRES_HOURS * 60 * 60 * 1000);
  user.verificationToken   = verificationToken;
  user.verificationExpires = verificationExpires;
  await user.save();

  sendVerificationEmail(user.email, user.name, verificationToken).catch(console.error);
  res.json({ message: 'Verification email resent' });
});

// ── POST /api/auth/forgot-password ────────────────────────
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  const user = await User.findOne({ email });
  // Always return success to prevent email enumeration
  if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

  const resetToken   = uuidv4();
  const resetExpires = new Date(Date.now() + RESET_EXPIRES_HOURS * 60 * 60 * 1000);
  user.resetPasswordToken   = resetToken;
  user.resetPasswordExpires = resetExpires;
  await user.save();

  sendPasswordResetEmail(user.email, user.name, resetToken).catch(console.error);
  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// ── POST /api/auth/reset-password ─────────────────────────
router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Token and password required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  } as any);
  if (!user) return res.status(400).json({ message: 'Invalid or expired reset link' });

  user.password             = password;
  user.resetPasswordToken   = null;
  user.resetPasswordExpires = null;
  await user.save();

  // Revoke all refresh tokens
  await RefreshToken.deleteMany({ user: user._id });

  res.json({ message: 'Password reset successfully. Please log in.' });
});

// ── POST /api/auth/refresh ─────────────────────────────────
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

  const stored = await RefreshToken.findOne({ token: refreshToken });
  if (!stored || stored.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ token: refreshToken });
    return res.status(401).json({ message: 'Refresh token expired or invalid' });
  }

  await RefreshToken.deleteOne({ token: refreshToken });
  const newAccessToken  = signAccess(String(stored.user));
  const newRefreshToken = await createRefreshToken(String(stored.user));

  res.json({ token: newAccessToken, refreshToken: newRefreshToken });
});

// ── POST /api/auth/logout ──────────────────────────────────
router.post('/logout', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken });
  res.json({ message: 'Logged out' });
});

// ── GET /api/auth/me ───────────────────────────────────────
router.get('/me', async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authorized' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET!) as { id: string };
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// ── PATCH /api/auth/profile ────────────────────────────────
router.patch('/profile', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, role, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId, 
      { name, email, role, bio }, 
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err: any) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: err.message || 'Failed to update profile' });
  }
});

// ── PATCH /api/auth/password ───────────────────────────────
router.patch('/password', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });
    
    user.password = newPassword;
    await user.save();
    
    // Delete old refresh tokens
    await RefreshToken.deleteMany({ user: req.userId });
    
    // Issue a fresh token pair so the user stays logged in
    const accessToken  = signAccess(String(user._id));
    const refreshToken = await createRefreshToken(String(user._id));
    
    res.json({ message: 'Password updated', token: accessToken, refreshToken });
  } catch (err: any) {
    console.error('Password update error:', err);
    res.status(500).json({ message: err.message || 'Failed to update password' });
  }
});

// ── GET /api/auth/export-data ──────────────────────────────
router.get('/export-data', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { Task } = await import('../models/Task');
    const { Project } = await import('../models/Project');
    const { Team } = await import('../models/Team');
    
    const user = await User.findById(req.userId).select('-password');
    const tasks = await Task.find({ owner: req.userId, deletedAt: null });
    const projects = await Project.find({ $or: [{ owner: req.userId }, { members: req.userId }] });
    const teams = await Team.find({ $or: [{ owner: req.userId }, { 'members.user': req.userId }] });
    
    const exportData = {
      user,
      tasks,
      projects,
      teams,
      exportedAt: new Date().toISOString(),
    };
    
    res.json(exportData);
  } catch (err: any) {
    console.error('Export data error:', err);
    res.status(500).json({ message: err.message || 'Failed to export data' });
  }
});

// ── POST /api/auth/avatar ──────────────────────────────────
router.post('/avatar', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { avatar } = req.body;
    
    // Validate base64 image (max 2MB)
    if (!avatar || !avatar.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image format' });
    }
    
    // Check size (base64 is ~33% larger than binary)
    const sizeInBytes = (avatar.length * 3) / 4;
    if (sizeInBytes > 2 * 1024 * 1024) {
      return res.status(400).json({ message: 'Image too large (max 2MB)' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err: any) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ message: err.message || 'Failed to upload avatar' });
  }
});

// ── PATCH /api/auth/preferences ────────────────────────────
router.patch('/preferences', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { language, region, timezone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { language, region, timezone },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err: any) {
    console.error('Preferences update error:', err);
    res.status(500).json({ message: err.message || 'Failed to update preferences' });
  }
});

// ── PATCH /api/auth/notification-preferences ───────────────
router.patch('/notification-preferences', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { notificationPreferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { notificationPreferences },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err: any) {
    console.error('Notification preferences update error:', err);
    res.status(500).json({ message: err.message || 'Failed to update notification preferences' });
  }
});

// ── PATCH /api/auth/two-factor ──────────────────────────────
router.patch('/two-factor', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { enabled } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { twoFactorEnabled: enabled },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to update 2FA' });
  }
});

// ── PATCH /api/auth/workspace-settings ─────────────────────
router.patch('/workspace-settings', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceSettings } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { workspaceSettings },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to update workspace settings' });
  }
});

// ── GET /api/auth/sessions ─────────────────────────────────
router.get('/sessions', protect, async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await RefreshToken.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch sessions' });
  }
});

// ── DELETE /api/auth/sessions/:id ──────────────────────────
router.delete('/sessions/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    await RefreshToken.deleteOne({ _id: req.params.id, user: req.userId });
    res.json({ message: 'Session revoked' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to revoke session' });
  }
});

export default router;
