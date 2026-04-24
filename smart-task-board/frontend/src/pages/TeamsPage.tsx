import { useState, useEffect } from 'react';
import { Users, CheckSquare, Clock, AlertTriangle, Plus, MoreVertical, UserPlus, Loader2, X, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as teamsApi from '../api/teams';
import type { TeamData, TeamMember, TeamRole } from '../api/teams';

const roleColors: Record<TeamRole, string> = {
  admin:  'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  member: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  guest:  'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
};

const avatarColors = [
  'bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
  'bg-orange-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-rose-500',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export const TeamsPage = () => {
  const { token, user } = useAuth();
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('member');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const isOwner = data?.team.owner === user?._id ||
    data?.team.members.find(m => m.user._id === user?._id)?.role === 'admin';

  useEffect(() => {
    if (!token) return;
    teamsApi.getMyTeam(token)
      .then(setData)
      .finally(() => setLoading(false));
  }, [token]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    setInviteLoading(true);
    try {
      const result = await teamsApi.inviteMember(token!, inviteEmail, inviteRole);
      setInviteSuccess(result.message);
      setInviteEmail('');
      // Refresh
      const updated = await teamsApi.getMyTeam(token!);
      setData(updated);
    } catch (err: any) {
      setInviteError(err.response?.data?.message || 'Failed to invite');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    await teamsApi.removeMember(token!, userId);
    const updated = await teamsApi.getMyTeam(token!);
    setData(updated);
    setOpenMenu(null);
  };

  const handleRoleChange = async (userId: string, role: TeamRole) => {
    await teamsApi.changeRole(token!, userId, role);
    const updated = await teamsApi.getMyTeam(token!);
    setData(updated);
    setOpenMenu(null);
  };

  const getStats = (userId: string) =>
    data?.taskStats.find(s => s.userId === userId) || { active: 0, completed: 0 };

  const filteredMembers = data?.team.members.filter(m =>
    m.user.name.toLowerCase().includes(search.toLowerCase()) ||
    m.user.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="px-8 py-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Team Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your collaborators, roles, and monitor workload distribution.
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <UserPlus size={15} />
            Invite Member
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users,         label: 'Total Members', value: data?.team.members.length || 0,  color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' },
          { icon: CheckSquare,   label: 'Active Tasks',  value: data?.totalTasks || 0,            color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' },
          { icon: Clock,         label: 'Avg. Task Time', value: '—',                             color: 'bg-orange-50 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400' },
          { icon: AlertTriangle, label: 'Overdue',       value: data?.overdueTasks || 0,          color: 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 mb-6 w-72 focus-within:ring-2 focus-within:ring-blue-400/30 transition-all shadow-sm">
        <Search size={14} className="text-gray-400 shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Find specific collaborators..."
          className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 flex-1"
        />
      </div>

      {/* Member grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredMembers.map(member => {
          const stats = getStats(member.user._id);
          const isMe = member.user._id === user?._id;
          const color = getAvatarColor(member.user.name);

          return (
            <div key={member.user._id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col items-center text-center relative hover:shadow-md transition-shadow">
              {/* Menu */}
              {isOwner && !isMe && (
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => setOpenMenu(openMenu === member.user._id ? null : member.user._id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <MoreVertical size={14} />
                  </button>
                  {openMenu === member.user._id && (
                    <div className="absolute right-0 top-8 w-44 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10 overflow-hidden">
                      <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Change Role</p>
                      {(['admin', 'member', 'guest'] as TeamRole[]).map(r => (
                        <button key={r} onClick={() => handleRoleChange(member.user._id, r)}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors capitalize ${
                            member.role === r
                              ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/30'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}>
                          {r}
                        </button>
                      ))}
                      <div className="border-t border-gray-100 dark:border-gray-800">
                        <button onClick={() => handleRemove(member.user._id)}
                          className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                          Remove member
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Avatar */}
              <div className="relative mb-3">
                <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
                  {member.user.name[0].toUpperCase()}
                </div>
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white dark:border-gray-900 rounded-full" />
              </div>

              {/* Name + role */}
              <p className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">{member.user.name}</p>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize mb-4 ${roleColors[member.role]}`}>
                {member.role}
              </span>

              {/* Stats */}
              <div className="flex justify-around w-full border-t border-gray-100 dark:border-gray-800 pt-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Active Tasks</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.active}</p>
                </div>
                <div className="w-px bg-gray-100 dark:bg-gray-800" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Completed</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.completed}</p>
                </div>
              </div>

              <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                View Profile
              </button>
            </div>
          );
        })}

        {/* Add member card */}
        {isOwner && (
          <button
            onClick={() => setShowInvite(true)}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-5 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-all group min-h-[220px]"
          >
            <div className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-blue-400 flex items-center justify-center transition-colors">
              <Plus size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Add Team Member</p>
            <p className="text-xs text-gray-400">Scale your workforce</p>
          </button>
        )}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm" onClick={() => setShowInvite(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Invite Team Member</h2>
                <p className="text-xs text-gray-400 mt-0.5">They'll be added instantly if they have an account</p>
              </div>
              <button onClick={() => setShowInvite(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={15} />
              </button>
            </div>

            {inviteError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg mb-4">{inviteError}</p>}
            {inviteSuccess && <p className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-lg mb-4">{inviteSuccess}</p>}

            <form onSubmit={handleInvite} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email Address</label>
                <input
                  type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com" required
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-300 transition-all text-gray-800 dark:text-gray-200 placeholder-gray-400"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value as TeamRole)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400/40 transition-all text-gray-800 dark:text-gray-200">
                  <option value="admin">Admin — full access</option>
                  <option value="member">Member — can create & edit tasks</option>
                  <option value="guest">Guest — view only</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowInvite(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={inviteLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors shadow-sm">
                  {inviteLoading && <Loader2 size={13} className="animate-spin" />}
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
