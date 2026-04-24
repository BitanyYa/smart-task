import { useState, FormEvent } from 'react';
import { User, Lock, Palette, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

export const SettingsPage = () => {
  const { user, token } = useAuth();
  const { theme, toggle } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const inputCls = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-300 dark:focus:border-blue-600 focus:bg-white dark:focus:bg-gray-700 transition-all";

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);
    try {
      await axios.patch('http://localhost:4000/api/auth/profile',
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordLoading(true);
    try {
      await axios.patch('http://localhost:4000/api/auth/password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
          <Icon size={14} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );

  return (
    <div className="px-8 py-7 max-w-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and preferences.</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Profile */}
        <Section icon={User} title="Profile">
          <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
            {profileError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{profileError}</p>}
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={profileLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors shadow-sm">
                {profileLoading ? <Loader2 size={13} className="animate-spin" /> : profileSaved ? <Check size={13} /> : null}
                {profileSaved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Section>

        {/* Password */}
        <Section icon={Lock} title="Change Password">
          <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
            {passwordError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{passwordError}</p>}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" minLength={6} className={inputCls} />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={passwordLoading || !currentPassword || !newPassword}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors shadow-sm">
                {passwordLoading ? <Loader2 size={13} className="animate-spin" /> : passwordSaved ? <Check size={13} /> : null}
                {passwordSaved ? 'Updated!' : 'Update Password'}
              </button>
            </div>
          </form>
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Appearance">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Theme</p>
              <p className="text-xs text-gray-400 mt-0.5">Switch between light and dark mode</p>
            </div>
            <button onClick={toggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
};
