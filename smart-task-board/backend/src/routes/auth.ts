import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';

const router = Router();

const ACCESS_EXPIRES  = '15m';
const REFRESH_EXPIRES_DAYS = 7;

const signAccess = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: ACCESS_EXPIRES } as jwt.SignOptions);

const createRefreshToken = async (userId: string) => {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ token, user: userId, expiresAt });
  return token;
};

// POST /api/auth/register
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

    const user = await User.create({ name, email, password });
    const accessToken   = signAccess(String(user._id));
    const refreshToken  = await createRefreshToken(String(user._id));

    res.status(201).json({ token: accessToken, refreshToken, user });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// POST /api/auth/login
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

    res.json({ token: accessToken, refreshToken, user });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// POST /api/auth/refresh — get new access token using refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

  try {
    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored || stored.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ token: refreshToken });
      return res.status(401).json({ message: 'Refresh token expired or invalid' });
    }

    // Rotate: delete old, issue new
    await RefreshToken.deleteOne({ token: refreshToken });
    const newAccessToken  = signAccess(String(stored.user));
    const newRefreshToken = await createRefreshToken(String(stored.user));

    res.json({ token: newAccessToken, refreshToken: newRefreshToken });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/logout — revoke refresh token
router.post('/logout', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken });
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
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

// PATCH /api/auth/profile
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

// PATCH /api/auth/password
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
    // Revoke all refresh tokens on password change
    await RefreshToken.deleteMany({ user: decoded.id });
    res.json({ message: 'Password updated' });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
