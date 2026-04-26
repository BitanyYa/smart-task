import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { sendVerificationEmail, sendPasswordResetEmail } from '../config/mailer';

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
      name:     z.string().min(2),
      email:    z.string().email(),
      password: z.string().min(6),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });

    const { name, email, password } = parsed.data;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const verificationToken   = uuidv4();
    const verificationExpires = new Date(Date.now() + VERIFY_EXPIRES_HOURS * 60 * 60 * 1000);

    const user = await User.create({
      name, email, password,
      verificationToken,
      verificationExpires,
      isVerified: false,
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, name, verificationToken).catch(err =>
      console.error('Email send failed:', err.message)
    );

    const accessToken  = signAccess(String(user._id));
    const refreshToken = await createRefreshToken(String(user._id));

    res.status(201).json({
      token: accessToken,
      refreshToken,
      user,
      message: 'Account created. Please check your email to verify your account.',
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// ── POST /api/auth/login ───────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      email:    z.string().email(),
      password: z.string().min(1),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });

    const { email, password } = parsed.data;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
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
router.patch('/profile', async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authorized' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET!) as { id: string };
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(decoded.id, { name, email }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// ── PATCH /api/auth/password ───────────────────────────────
router.patch('/password', async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authorized' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET!) as { id: string };
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    await RefreshToken.deleteMany({ user: decoded.id });
    res.json({ message: 'Password updated' });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
