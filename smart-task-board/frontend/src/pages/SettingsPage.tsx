import { useState, useEffect, type FormEvent } from 'react';
import {
  User, Settings, Bell, LayoutDashboard, Shield,
  Lock, ChevronRight, Loader2, Check, Pencil, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/auth';

type Tab = 'profile' | 'account' | 'notifications' | 'workspace' | 'security';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'account',       label: 'Account',        icon: Settings },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'workspace',     label: 'Workspace',      icon: LayoutDashboard },
  { id: 'security',      label: 'Security',       icon: Shield },
];

const inputCls = "w-full bg-cream-100 dark:bg-neutral-800 border border-cream-300 dark:border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-neutral-800 dark:text-cream-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-all";
const labelCls = "text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-1.5 block";

export const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggle } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || 'Product Designer');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(user?.twoFactorEnabled || false);
  const [passLoading, setPassLoading] = useState(false);
  const [passSaved, setPassSaved] = useState(false);
  const [passError, setPassError] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Export state
  const [exportLoading, setExportLoading] = useState(false);
  
  // Avatar state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  // Account state
  const [language, setLanguage] = useState(user?.language || 'English (United States)');
  const [region, setRegion] = useState(user?.region || 'North America');
  const [timezone, setTimezone] = useState(user?.timezone || '(GMT-05:00) Eastern Time');
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);
  
  // Workspace state
  const [wsName, setWsName] = useState(user?.workspaceSettings?.name || 'My Workspace');
  const [wsView, setWsView] = useState(user?.workspaceSettings?.defaultView || 'Kanban Board');
  const [wsPriority, setWsPriority] = useState(user?.workspaceSettings?.defaultPriority || 'Medium');
  const [wsAutoArchive, setWsAutoArchive] = useState(user?.workspaceSettings?.autoArchive ?? true);
  const [wsLoading, setWsLoading] = useState(false);
  const [wsSaved, setWsSaved] = useState(false);

  // Notifications state
  const [notifs, setNotifs] = useState({
    email: user?.notificationPreferences?.email ?? true,
    push: user?.notificationPreferences?.push ?? true,
    taskUpdates: user?.notificationPreferences?.taskUpdates ?? true,
    mentions: user?.notificationPreferences?.mentions ?? true,
    weeklyDigest: user?.notificationPreferences?.weeklyDigest ?? false,
    marketing: user?.notificationPreferences?.marketing ?? false,
  });

  useEffect(() => {
    if (activeTab === 'security' || activeTab === 'account') {
      fetchSessions();
    }
  }, [activeTab]);

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const response = await api.get('/auth/sessions');
      setSessions(response.data);
    } catch (err) {
      console.error('Failed to fetch sessions');
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);
    try {
      const response = await api.patch('/auth/profile', { name, email, role, bio });
      // Update context with new user data
      updateUser(response.data);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassLoading(true);
    try {
      const response = await api.patch('/auth/password', { currentPassword, newPassword });
      // Store the new tokens so the session stays alive
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      setPassSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPassSaved(false), 2000);
    } catch (err: any) {
      setPassError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPassLoading(false);
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const response = await api.get('/auth/export-data');
      
      // Create downloadable JSON file
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `smarttask-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image too large (max 2MB)');
      return;
    }

    setAvatarError('');
    setAvatarUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const response = await api.post('/auth/avatar', { avatar: base64 });

        // Update context with new user data
        updateUser(response.data);
        setAvatarUploading(false);
      };
      reader.onerror = () => {
        setAvatarError('Failed to read image');
        setAvatarUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setAvatarError(err.response?.data?.message || 'Failed to upload avatar');
      setAvatarUploading(false);
    }
  };

  const handlePreferencesSave = async () => {
    setPrefsLoading(true);
    try {
      const response = await api.patch('/auth/preferences', { language, region, timezone });
      updateUser(response.data);
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update preferences');
    } finally {
      setPrefsLoading(false);
    }
  };

  const handleNotificationToggle = async (key: keyof typeof notifs) => {
    const newNotifs = { ...notifs, [key]: !notifs[key] };
    setNotifs(newNotifs);
    
    try {
      const response = await api.patch('/auth/notification-preferences', { notificationPreferences: newNotifs });
      updateUser(response.data);
    } catch (err: any) {
      // Revert on error
      setNotifs(notifs);
      alert(err.response?.data?.message || 'Failed to update notification preferences');
    }
  };

  const handleTwoFactorToggle = async () => {
    const newValue = !twoFactor;
    setTwoFactor(newValue);
    try {
      const response = await api.patch('/auth/two-factor', { enabled: newValue });
      updateUser(response.data);
    } catch (err: any) {
      setTwoFactor(!newValue);
      alert(err.response?.data?.message || 'Failed to update 2FA');
    }
  };

  const handleWorkspaceSave = async (e: FormEvent) => {
    e.preventDefault();
    setWsLoading(true);
    try {
      const response = await api.patch('/auth/workspace-settings', { 
        workspaceSettings: {
          name: wsName,
          defaultView: wsView,
          defaultPriority: wsPriority,
          autoArchive: wsAutoArchive
        }
      });
      updateUser(response.data);
      setWsSaved(true);
      setTimeout(() => setWsSaved(false), 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update workspace settings');
    } finally {
      setWsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      setSessions(sessions.filter(s => s._id !== sessionId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to revoke session');
    }
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button type="button" onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-cream-100 dark:bg-neutral-900 rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="flex h-full">
      {/* Left settings nav */}
      <div className="w-52 shrink-0 border-r border-cream-300 dark:border-neutral-800 px-3 py-6 flex flex-col gap-1 bg-cream-100 dark:bg-neutral-900">
        <div className="px-3 mb-4">
          <p className="text-lg font-bold text-neutral-800 dark:text-cream-100">Settings</p>
          <p className="text-xs text-neutral-400 mt-0.5">Manage preferences</p>
        </div>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
              activeTab === tab.id
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-cream-200 dark:hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-800 font-medium'
            }`}>
            <tab.icon size={15} className="shrink-0" />
            {tab.label}
          </button>
        ))}

        {/* Pro plan card */}
        <div className="mt-auto mx-1 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/40 rounded-xl p-4">
          <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">Pro Plan</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">Get unlimited workspaces and advanced analytics.</p>
          <button className="w-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold py-2 rounded-lg transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-7 bg-cream-200 dark:bg-neutral-950">

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSave}>
            <div className="bg-cream-100 dark:bg-neutral-900 rounded-2xl border border-cream-300 dark:border-neutral-800 shadow-sm mb-5">
              <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 dark:border-neutral-800">
                <h2 className="text-lg font-bold text-neutral-800 dark:text-cream-100">Profile</h2>
                <span className="text-xs text-neutral-400">Manage your public information</span>
              </div>
              <div className="p-6 flex gap-6">
                {/* Avatar */}
                <div className="shrink-0">
                  <div className="relative">
                    {avatarUploading ? (
                      <div className="w-20 h-20 rounded-full bg-cream-200 dark:bg-neutral-800 flex items-center justify-center">
                        <Loader2 size={24} className="text-primary-500 animate-spin" />
                      </div>
                    ) : user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user?.name}
                        className="w-20 h-20 rounded-full object-cover shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                        {user?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={avatarUploading}
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center shadow-md hover:bg-primary-600 transition-colors cursor-pointer">
                      <Pencil size={12} className="text-white" />
                    </label>
                  </div>
                  {avatarError && <p className="text-xs text-red-500 mt-2">{avatarError}</p>}
                </div>

                {/* Fields */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  {profileError && <div className="col-span-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{profileError}</div>}
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Professional Role</label>
                    <select value={role} onChange={e => setRole(e.target.value)} className={inputCls}>
                      {[
                        'Frontend Developer',
                        'Backend Developer', 
                        'Full-Stack Developer',
                        'Mobile Developer',
                        'UI/UX Designer',
                        'QA (Quality Assurance) Engineer',
                        'Database Administrator (DBA)',
                        'Product Designer',
                        'Software Engineer',
                        'Project Manager',
                        'Data Analyst',
                        'DevOps Engineer',
                        'Other'
                      ].map(r => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                      placeholder="Tell your team a bit about yourself..."
                      className={`${inputCls} resize-none`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Export data */}
            <div className="bg-cream-100 dark:bg-neutral-900 rounded-2xl border border-cream-300 dark:border-neutral-800 shadow-sm mb-5 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cream-200 dark:bg-neutral-800 flex items-center justify-center">
                  <Download size={15} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-cream-100">Export Data</p>
                  <p className="text-xs text-neutral-400">Download a copy of your task history and account data.</p>
                </div>
              </div>
              <button type="button" onClick={handleExportData} disabled={exportLoading}
                className="flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors disabled:opacity-60">
                {exportLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                {exportLoading ? 'Exporting...' : 'Export Data'}
              </button>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { 
                setName(user?.name || ''); 
                setEmail(user?.email || ''); 
                setRole(user?.role || 'Product Designer');
                setBio(user?.bio || '');
              }}
                className="px-5 py-2.5 text-sm font-semibold text-neutral-600 dark:text-neutral-400 border border-cream-300 dark:border-neutral-700 rounded-xl hover:bg-cream-200 dark:hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={profileLoading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-60 rounded-xl transition-colors shadow-sm">
                {profileLoading ? <Loader2 size={14} className="animate-spin" /> : profileSaved ? <Check size={14} /> : null}
                {profileSaved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* ACCOUNT TAB */}
        {activeTab === 'account' && (
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-cream-100 dark:bg-neutral-900 rounded-2xl border border-cream-300 dark:border-neutral-800 shadow-sm p-6">
              <h2 className="text-lg font-bold text-neutral-800 dark:text-cream-100 mb-5">Account Preferences</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Language</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)} className={inputCls}>
                    <option>English (United States)</option>
                    <option>English (United Kingdom)</option>
                    <option>French</option>
                    <option>Spanish</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Region</label>
                  <select value={region} onChange={e => setRegion(e.target.value)} className={inputCls}>
                    <option>North America</option>
                    <option>Europe</option>
                    <option>Asia Pacific</option>
                    <option>Africa</option>
                    <option>Middle East</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Timezone</label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)} className={inputCls}>
                    {['(GMT-08:00) Pacific Time','(GMT-07:00) Mountain Time','(GMT-06:00) Central Time','(GMT-05:00) Eastern Time','(GMT+00:00) UTC','(GMT+01:00) Central European Time','(GMT+03:00) East Africa Time'].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Theme</label>
                  <div className="flex gap-2">
                    {(['light', 'dark'] as const).map(t => (
                      <button key={t} type="button" onClick={() => theme !== t && toggle()}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors capitalize ${
                          theme === t
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'bg-cream-100 dark:bg-neutral-800 border-cream-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-primary-400'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-5">
                <button onClick={handlePreferencesSave} disabled={prefsLoading}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-60 rounded-xl transition-colors shadow-sm">
                  {prefsLoading ? <Loader2 size={14} className="animate-spin" /> : prefsSaved ? <Check size={14} /> : null}
                  {prefsSaved ? 'Saved!' : 'Save Preferences'}
                </button>
              </div>
            </div>

            <div className="bg-cream-100 dark:bg-neutral-900 rounded-2xl border border-cream-300 dark:border-neutral-800 shadow-sm p-6">
              <h2 className="text-lg font-bold text-neutral-800 dark:text-cream-100 mb-5">Security</h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3.5 bg-cream-200 dark:bg-neutral-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                      <Lock size={14} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800 dark:text-cream-100">Password</p>
                      <p className="text-xs text-neutral-400">Last changed recently</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('security')} className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">Update</button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-cream-200 dark:bg-neutral-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center">
                      <Shield size={14} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800 dark:text-cream-100">Two-Factor Auth</p>
                      <p className="text-xs text-neutral-400">{twoFactor ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                  <Toggle checked={twoFactor} onChange={handleTwoFactorToggle} />
                </div>

                <div onClick={() => setActiveTab('security')} className="flex items-center justify-between p-3.5 bg-cream-200 dark:bg-neutral-800 rounded-xl cursor-pointer hover:bg-cream-300 dark:hover:bg-neutral-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Settings size={14} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800 dark:text-cream-100">Active Sessions</p>
                      <p className="text-xs text-neutral-400">{sessions.length} device{sessions.length === 1 ? '' : 's'} logged in</p>
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-neutral-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="bg-cream-100 dark:bg-neutral-900 rounded-2xl border border-cream-300 dark:border-neutral-800 shadow-sm">
            <div className="px-6 py-4 border-b border-cream-200 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-neutral-800 dark:text-cream-100">Notifications</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Choose how and when you want to be notified</p>
            </div>
            <div className="divide-y divide-cream-200 dark:divide-neutral-800">
              {[
                { key: 'email',       label: 'Email Notifications',  desc: 'Receive updates via email' },
                { key: 'push',        label: 'Push Notifications',   desc: 'Browser push notifications' },
                { key: 'taskUpdates', label: 'Task Updates',         desc: 'When tasks are modified' },
                { key: 'mentions',    label: 'Mentions',             desc: 'When someone mentions you' },
                { key: 'weeklyDigest',label: 'Weekly Digest',        desc: 'Summary every Monday morning' },
                { key: 'marketing',   label: 'Product Updates',      desc: 'News and feature announcements' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800 dark:text-cream-100">{item.label}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle
                    checked={notifs[item.key as keyof typeof notifs]}
                    onChange={() => handleNotificationToggle(item.key as keyof typeof notifs)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WORKSPACE TAB */}
        {activeTab === 'workspace' && (
          <form onSubmit={handleWorkspaceSave} className="bg-cream-100 dark:bg-neutral-900 rounded-2xl border border-cream-300 dark:border-neutral-800 shadow-sm">
            <div className="px-6 py-4 border-b border-cream-200 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-neutral-800 dark:text-cream-100">Workspace</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Configure your workspace settings</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className={labelCls}>Workspace Name</label>
                <input value={wsName} onChange={e => setWsName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Default Task View</label>
                <select value={wsView} onChange={e => setWsView(e.target.value)} className={inputCls}>
                  <option>Kanban Board</option>
                  <option>List View</option>
                  <option>Calendar View</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Default Priority</label>
                <select value={wsPriority} onChange={e => setWsPriority(e.target.value)} className={inputCls}>
                  <option>Medium</option>
                  <option>Low</option>
                  <option>High</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-cream-100">Auto-archive completed tasks</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Move done tasks to archive after 7 days</p>
                </div>
                <Toggle checked={wsAutoArchive} onChange={() => setWsAutoArchive(!wsAutoArchive)} />
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={wsLoading}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-60 rounded-xl transition-colors shadow-sm">
                  {wsLoading ? <Loader2 size={14} className="animate-spin" /> : wsSaved ? <Check size={14} /> : null}
                  {wsSaved ? 'Saved!' : 'Save Workspace Settings'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="flex flex-col gap-5">
            <form onSubmit={handlePasswordUpdate} className="bg-cream-100 dark:bg-neutral-900 rounded-2xl border border-cream-300 dark:border-neutral-800 shadow-sm">
              <div className="px-6 py-4 border-b border-cream-200 dark:border-neutral-800">
                <h2 className="text-lg font-bold text-neutral-800 dark:text-cream-100">Change Password</h2>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {passError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{passError}</p>}
                <div>
                  <label className={labelCls}>Current Password</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" minLength={6} className={inputCls} />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={passLoading || !currentPassword || !newPassword}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-60 rounded-xl transition-colors shadow-sm">
                    {passLoading ? <Loader2 size={14} className="animate-spin" /> : passSaved ? <Check size={14} /> : null}
                    {passSaved ? 'Updated!' : 'Update Password'}
                  </button>
                </div>
              </div>
            </form>

            <div className="bg-cream-100 dark:bg-neutral-900 rounded-2xl border border-cream-300 dark:border-neutral-800 shadow-sm">
              <div className="px-6 py-4 border-b border-cream-200 dark:border-neutral-800">
                <h2 className="text-lg font-bold text-neutral-800 dark:text-cream-100">Security Settings</h2>
              </div>
              <div className="divide-y divide-cream-200 dark:divide-neutral-800">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
                      <Shield size={15} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800 dark:text-cream-100">Two-Factor Authentication</p>
                      <p className="text-xs text-neutral-400">{twoFactor ? 'Protecting your account' : 'Not enabled'}</p>
                    </div>
                  </div>
                  <Toggle checked={twoFactor} onChange={handleTwoFactorToggle} />
                </div>
              </div>
            </div>

            <div className="bg-cream-100 dark:bg-neutral-900 rounded-2xl border border-cream-300 dark:border-neutral-800 shadow-sm">
              <div className="px-6 py-4 border-b border-cream-200 dark:border-neutral-800">
                <h2 className="text-lg font-bold text-neutral-800 dark:text-cream-100">Active Sessions</h2>
                <p className="text-xs text-neutral-400">Devices that are currently logged into your account</p>
              </div>
              <div className="divide-y divide-cream-200 dark:divide-neutral-800">
                {sessionsLoading ? (
                  <div className="p-10 flex justify-center">
                    <Loader2 className="animate-spin text-primary-500" />
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="p-6 text-sm text-neutral-500 text-center">No active sessions found.</p>
                ) : sessions.map(session => (
                  <div key={session._id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-cream-200 dark:bg-neutral-800 flex items-center justify-center">
                        <LayoutDashboard size={15} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-800 dark:text-cream-100">
                          {session.token.substring(0, 8)}... (Refresh Token)
                        </p>
                        <p className="text-xs text-neutral-400">
                          Expires: {new Date(session.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRevokeSession(session._id)}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};




