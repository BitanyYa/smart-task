import { useState, useEffect } from 'react';
import { Users, CheckSquare, Clock, AlertTriangle, Plus, MoreVertical, UserPlus, Loader2, X, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as teamsApi from '../api/teams';
import * as projectsApi from '../api/projects';
import type { TeamData, TeamRole, TeamMember } from '../api/teams';
import type { Project } from '../api/projects';

const roleColors: Record<TeamRole, string> = {
  admin:  'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  member: 'bg-cream-300 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
  guest:  'bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-400',
};

const avatarColors = [
  'bg-primary-500', 'bg-primary-500', 'bg-sage-500', 'bg-primary-500',
  'bg-primary-500', 'bg-emerald-500', 'bg-primary-500', 'bg-primary-500',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export const TeamsPage = () => {
  const { user } = useAuth();
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
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [editingTeamName, setEditingTeamName] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showProjectAssign, setShowProjectAssign] = useState(false);
  const [assigningMemberId, setAssigningMemberId] = useState<string | null>(null);

  const isOwner = data?.team.owner === user?._id ||
    data?.team.members.find(m => m.user._id === user?._id)?.role === 'admin';

  useEffect(() => {
    teamsApi.getMyTeam()
      .then(d => {
        setData(d);
        setTeamName(d.team.name);
      })
      .finally(() => setLoading(false));
    
    // Fetch projects for invite dropdown
    projectsApi.fetchProjects()
      .then(setProjects)
      .catch(() => {});
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    setInviteLoading(true);
    try {
      const result = await teamsApi.inviteMember(inviteEmail, inviteRole, selectedProjectId || undefined);
      setInviteSuccess(result.message);
      setInviteEmail('');
      setSelectedProjectId('');
      // Refresh
      const updated = await teamsApi.getMyTeam();
      setData(updated);
    } catch (err: any) {
      setInviteError(err.response?.data?.message || 'Failed to invite');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    await teamsApi.removeMember(userId);
    const updated = await teamsApi.getMyTeam();
    setData(updated);
    setOpenMenu(null);
  };

  const handleRoleChange = async (userId: string, role: TeamRole) => {
    await teamsApi.changeRole(userId, role);
    const updated = await teamsApi.getMyTeam();
    setData(updated);
    setOpenMenu(null);
  };

  const handleTeamNameSave = async () => {
    if (!teamName.trim() || teamName === data?.team.name) {
      setEditingTeamName(false);
      return;
    }
    try {
      await teamsApi.renameTeam(teamName.trim());
      const updated = await teamsApi.getMyTeam();
      setData(updated);
      setEditingTeamName(false);
    } catch {
      setTeamName(data?.team.name || '');
      setEditingTeamName(false);
    }
  };

  const handleAssignToProject = async (projectId: string) => {
    if (!assigningMemberId) return;
    try {
      await teamsApi.addMemberToProject(assigningMemberId, projectId);
      setShowProjectAssign(false);
      setAssigningMemberId(null);
      // Refresh projects to show updated member count
      const updatedProjects = await projectsApi.fetchProjects();
      setProjects(updatedProjects);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign member to project');
    }
  };

  const getStats = (userId: string) =>
    data?.taskStats.find(s => s.userId === userId) || { active: 0, completed: 0 };

  const filteredMembers = data?.team.members.filter(m =>
    m.user.name.toLowerCase().includes(search.toLowerCase()) ||
    m.user.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="px-8 py-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {editingTeamName ? (
              <input
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                onBlur={handleTeamNameSave}
                onKeyDown={e => e.key === 'Enter' && handleTeamNameSave()}
                autoFocus
                className="text-2xl font-bold text-neutral-800 dark:text-cream-100 tracking-tight bg-cream-200 dark:bg-neutral-800 border border-primary-400 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary-400/40"
              />
            ) : (
              <>
                <h1 className="text-2xl font-bold text-neutral-800 dark:text-cream-100 tracking-tight">{data?.team.name}</h1>
                {isOwner && (
                  <button
                    onClick={() => setEditingTeamName(true)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-cream-200 dark:hover:bg-neutral-800 transition-colors"
                    title="Edit team name">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage your collaborators, roles, and monitor workload distribution.
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <UserPlus size={15} />
            Invite Member
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users,         label: 'Total Members', value: data?.team.members.length || 0,  color: 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400' },
          { icon: CheckSquare,   label: 'Active Tasks',  value: data?.totalTasks || 0,            color: 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400' },
          { icon: Clock,         label: 'Avg. Task Time', value: data?.avgCompletionTime ? `${data.avgCompletionTime}h` : '—', color: 'bg-primary-50 dark:bg-primary-950/40 text-orange-500 dark:text-orange-400' },
          { icon: AlertTriangle, label: 'Overdue',       value: data?.overdueTasks || 0,          color: 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-cream-100 dark:bg-neutral-900 rounded-xl border border-cream-300 dark:border-neutral-800 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">{s.label}</p>
              <p className="text-xl font-bold text-neutral-800 dark:text-cream-100">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-cream-100 dark:bg-neutral-900 border border-cream-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 mb-6 w-72 focus-within:ring-2 focus-within:ring-primary-400/30 transition-all shadow-sm">
        <Search size={14} className="text-neutral-400 shrink-0" />
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
            <div key={member.user._id} className="bg-cream-100 dark:bg-neutral-900 rounded-2xl border border-cream-300 dark:border-neutral-800 shadow-sm p-5 flex flex-col items-center text-center relative hover:shadow-md transition-shadow">
              {/* Menu */}
              {isOwner && !isMe && (
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => setOpenMenu(openMenu === member.user._id ? null : member.user._id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-gray-600 hover:bg-cream-200 dark:hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <MoreVertical size={14} />
                  </button>
                  {openMenu === member.user._id && (
                    <div className="absolute right-0 top-8 w-44 bg-cream-100 dark:bg-neutral-900 rounded-xl shadow-lg border border-cream-300 dark:border-neutral-700 z-10 overflow-hidden">
                      <p className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Change Role</p>
                      {(['admin', 'member', 'guest'] as TeamRole[]).map(r => (
                        <button key={r} onClick={() => handleRoleChange(member.user._id, r)}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors capitalize ${
                            member.role === r
                              ? 'text-primary-600 dark:text-primary-400 font-semibold bg-primary-50 dark:bg-primary-950/30'
                              : 'text-neutral-700 dark:text-neutral-300 hover:bg-cream-200 dark:hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800'
                          }`}>
                          {r}
                        </button>
                      ))}
                      <div className="border-t border-cream-200 dark:border-neutral-800">
                        <button
                          onClick={() => {
                            setAssigningMemberId(member.user._id);
                            setShowProjectAssign(true);
                            setOpenMenu(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors">
                          Assign to project
                        </button>
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
                {member.user.avatar ? (
                  <img 
                    src={member.user.avatar} 
                    alt={member.user.name}
                    className="w-16 h-16 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
                    {member.user.name[0].toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-sage-400 border-2 border-cream-100 dark:border-neutral-900 rounded-full" />
              </div>

              {/* Name + role */}
              <p className="text-base font-bold text-neutral-800 dark:text-cream-100 mb-1">{member.user.name}</p>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize mb-4 ${roleColors[member.role]}`}>
                {member.role}
              </span>

              {/* Stats */}
              <div className="flex justify-around w-full border-t border-cream-200 dark:border-neutral-800 pt-3 mb-4">
                <div>
                  <p className="text-xs text-neutral-400 mb-0.5">Active Tasks</p>
                  <p className="text-lg font-bold text-neutral-800 dark:text-cream-100">{stats.active}</p>
                </div>
                <div className="w-px bg-cream-200 dark:bg-neutral-800" />
                <div>
                  <p className="text-xs text-neutral-400 mb-0.5">Completed</p>
                  <p className="text-lg font-bold text-neutral-800 dark:text-cream-100">{stats.completed}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(member)}
                className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                View Profile
              </button>
            </div>
          );
        })}

        {/* Add member card */}
        {isOwner && (
          <button
            onClick={() => setShowInvite(true)}
            className="bg-cream-200 dark:bg-neutral-800/50 rounded-2xl border-2 border-dashed border-cream-300 dark:border-neutral-700 p-5 flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-950/10 transition-all group min-h-[220px]"
          >
            <div className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-primary-400 flex items-center justify-center transition-colors">
              <Plus size={18} className="text-neutral-400 group-hover:text-primary-500 transition-colors" />
            </div>
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Add Team Member</p>
            <p className="text-xs text-neutral-400">Scale your workforce</p>
          </button>
        )}
      </div>

      {/* Pending invites */}
      {isOwner && data?.team.invites && data.team.invites.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest mb-3">Pending Invites</h2>
          <div className="bg-cream-100 dark:bg-neutral-900 rounded-xl border border-cream-300 dark:border-neutral-800 overflow-hidden shadow-sm">
            {data.team.invites.map((inv: any) => (
              <div key={inv.token} className="flex items-center justify-between px-5 py-3.5 border-b border-cream-200 dark:border-neutral-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{inv.email}</p>
                  <p className="text-xs text-neutral-400 capitalize mt-0.5">
                    Invited as {inv.role}
                    {inv.projectId && <span className="text-primary-500"> · Project: {inv.projectId.name}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-cream-200 dark:bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded-full">Pending</span>
                  <button
                    onClick={async () => {
                      await teamsApi.cancelInvite(inv.token);
                      const updated = await teamsApi.getMyTeam();
                      setData(updated);
                    }}
                    className="text-xs text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm" onClick={() => setShowInvite(false)}>
          <div className="bg-cream-100 dark:bg-neutral-900 rounded-2xl shadow-xl border border-cream-300 dark:border-neutral-700 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-neutral-800 dark:text-cream-100">Invite Team Member</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  They'll be added instantly if they have an account
                  {projects.length > 0 && ` · ${projects.length} ${projects.length === 1 ? 'project' : 'projects'} available`}
                </p>
              </div>
              <button onClick={() => setShowInvite(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-cream-200 dark:hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 transition-colors">
                <X size={15} />
              </button>
            </div>

            {inviteError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg mb-4">{inviteError}</p>}
            {inviteSuccess && <p className="text-sm text-sage-600 bg-sage-50 dark:bg-sage-950/30 px-3 py-2 rounded-lg mb-4">{inviteSuccess}</p>}

            <form onSubmit={handleInvite} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Email Address</label>
                <input
                  type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com" required
                  className="w-full bg-cream-200 dark:bg-neutral-800 border border-cream-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-300 transition-all text-neutral-800 dark:text-cream-100 placeholder-gray-400"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value as TeamRole)}
                  className="w-full bg-cream-200 dark:bg-neutral-800 border border-cream-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-400/40 transition-all text-neutral-800 dark:text-cream-100">
                  <option value="admin">Admin — full access</option>
                  <option value="member">Member — can create & edit tasks</option>
                  <option value="guest">Guest — view only</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Assign to Project <span className="text-neutral-400">(optional)</span>
                </label>
                <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}
                  className="w-full bg-cream-200 dark:bg-neutral-800 border border-cream-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-400/40 transition-all text-neutral-800 dark:text-cream-100">
                  <option value="">No project assignment</option>
                  {projects.length === 0 && (
                    <option disabled>No projects available</option>
                  )}
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.members.length} {p.members.length === 1 ? 'member' : 'members'}) · {p.status}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-neutral-400">
                  {selectedProjectId 
                    ? 'Member will be added to this project automatically' 
                    : 'Member will only join the team workspace'}
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowInvite(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-cream-200 dark:hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={inviteLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-60 rounded-xl transition-colors shadow-sm">
                  {inviteLoading && <Loader2 size={13} className="animate-spin" />}
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Profile Modal */}
      {selectedMember && (() => {
        const stats = getStats(selectedMember.user._id);
        const color = getAvatarColor(selectedMember.user.name);
        const joinedDate = new Date(selectedMember.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm" onClick={() => setSelectedMember(null)}>
            <div className="bg-cream-100 dark:bg-neutral-900 rounded-2xl shadow-xl border border-cream-300 dark:border-neutral-700 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 border-b border-cream-200 dark:border-neutral-800">
                <button onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-cream-200 dark:hover:bg-neutral-800 transition-colors">
                  <X size={15} />
                </button>
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    {selectedMember.user.avatar ? (
                      <img 
                        src={selectedMember.user.avatar} 
                        alt={selectedMember.user.name}
                        className="w-16 h-16 rounded-full object-cover shadow-md"
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
                        {selectedMember.user.name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-800 dark:text-cream-100">{selectedMember.user.name}</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{selectedMember.user.email}</p>
                    {selectedMember.user.role && (
                      <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5 font-medium">{selectedMember.user.role}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Bio */}
                {selectedMember.user.bio && (
                  <div>
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">About</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{selectedMember.user.bio}</p>
                  </div>
                )}

                {/* Team Role */}
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Team Role</p>
                  <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full capitalize ${roleColors[selectedMember.role]}`}>
                    {selectedMember.role}
                  </span>
                </div>

                {/* Stats */}
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Task Statistics</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-cream-200 dark:bg-neutral-800 rounded-xl p-4">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Active Tasks</p>
                      <p className="text-2xl font-bold text-neutral-800 dark:text-cream-100">{stats.active}</p>
                    </div>
                    <div className="bg-cream-200 dark:bg-neutral-800 rounded-xl p-4">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Completed</p>
                      <p className="text-2xl font-bold text-neutral-800 dark:text-cream-100">{stats.completed}</p>
                    </div>
                  </div>
                </div>

                {/* Member since */}
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Member Since</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">{joinedDate}</p>
                </div>

                {/* Verification status */}
                {selectedMember.user.isVerified !== undefined && (
                  <div>
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Account Status</p>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      selectedMember.user.isVerified
                        ? 'bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {selectedMember.user.isVerified ? '✓ Verified' : '⚠ Unverified'}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              {isOwner && selectedMember.user._id !== user?._id && (
                <div className="px-6 py-4 border-t border-cream-200 dark:border-neutral-800 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedMember(null);
                      setOpenMenu(selectedMember.user._id);
                    }}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-cream-200 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                    Manage Member
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Project Assignment Modal */}
      {showProjectAssign && assigningMemberId && (() => {
        const member = data?.team.members.find(m => m.user._id === assigningMemberId);
        if (!member) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm" onClick={() => setShowProjectAssign(false)}>
            <div className="bg-cream-100 dark:bg-neutral-900 rounded-2xl shadow-xl border border-cream-300 dark:border-neutral-700 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 dark:border-neutral-800">
                <div>
                  <h2 className="text-base font-bold text-neutral-800 dark:text-cream-100">Assign to Project</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">{member.user.name}</p>
                </div>
                <button onClick={() => setShowProjectAssign(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-cream-200 dark:hover:bg-neutral-800 transition-colors">
                  <X size={15} />
                </button>
              </div>

              <div className="p-6">
                {projects.length === 0 ? (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-8">No projects available</p>
                ) : (
                  <div className="space-y-2">
                    {projects.map(p => {
                      const isMember = p.members.some(m => m._id === assigningMemberId);
                      return (
                        <button
                          key={p._id}
                          onClick={() => !isMember && handleAssignToProject(p._id)}
                          disabled={isMember}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                            isMember
                              ? 'bg-cream-200 dark:bg-neutral-800 border-cream-300 dark:border-neutral-700 opacity-60 cursor-not-allowed'
                              : 'bg-cream-200 dark:bg-neutral-800 border-cream-300 dark:border-neutral-700 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20'
                          }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-neutral-800 dark:text-cream-100">{p.name}</p>
                              <p className="text-xs text-neutral-400 mt-0.5 capitalize">
                                {p.members.length} {p.members.length === 1 ? 'member' : 'members'} · {p.status}
                              </p>
                            </div>
                            {isMember && (
                              <span className="text-xs bg-sage-100 dark:bg-sage-900/30 text-sage-600 dark:text-sage-400 px-2 py-1 rounded-full font-medium">
                                Already member
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};



