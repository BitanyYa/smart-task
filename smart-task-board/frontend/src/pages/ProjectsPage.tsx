import { useState, useEffect } from 'react';
import { Plus, Search, SlidersHorizontal, ArrowUpDown, MoreHorizontal, Pin, Calendar, Loader2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as projectsApi from '../api/projects';
import type { Project, ProjectStatus } from '../api/projects';

const statusConfig: Record<ProjectStatus, { label: string; cls: string }> = {
  active:    { label: 'ACTIVE',    cls: 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' },
  'on-hold': { label: 'ON HOLD',   cls: 'bg-cream-300 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400' },
  completed: { label: 'COMPLETED', cls: 'bg-sage-100 dark:bg-sage-900/20 text-sage-600 dark:text-sage-400' },
};

const progressColor: Record<ProjectStatus, string> = {
  active:    'bg-primary-500',
  'on-hold': 'bg-neutral-400',
  completed: 'bg-sage-500',
};

const avatarColors = ['bg-primary-500','bg-sage-500','bg-primary-400','bg-sage-400','bg-primary-600'];

export const ProjectsPage = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent'|'name'|'progress'>('recent');
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState<ProjectStatus>('active');
  const [newDue, setNewDue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    projectsApi.fetchProjects(token)
      .then(setProjects)
      .finally(() => setLoading(false));
  }, [token]);

  const openCreate = () => {
    setEditProject(null);
    setNewName(''); setNewDesc(''); setNewStatus('active'); setNewDue('');
    setShowModal(true);
  };

  const openEdit = (p: Project) => {
    setEditProject(p);
    setNewName(p.name); setNewDesc(p.description); setNewStatus(p.status);
    setNewDue(p.dueDate ? p.dueDate.split('T')[0] : '');
    setShowModal(true);
    setOpenMenu(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      if (editProject) {
        const updated = await projectsApi.updateProject(token!, editProject._id, {
          name: newName.trim(), description: newDesc.trim(),
          status: newStatus, dueDate: newDue || undefined,
        });
        setProjects(prev => prev.map(p => p._id === updated._id ? updated : p));
      } else {
        const created = await projectsApi.createProject(token!, {
          name: newName.trim(), description: newDesc.trim(),
          status: newStatus, dueDate: newDue || undefined,
        });
        setProjects(prev => [created, ...prev]);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handlePin = async (id: string) => {
    // Optimistic update
    setProjects(prev => prev.map(p => p._id === id ? { ...p, pinned: !p.pinned } : p));
    setOpenMenu(null);
    // Sync to backend in background
    projectsApi.togglePin(token!, id).catch(() => {
      // Revert on failure
      setProjects(prev => prev.map(p => p._id === id ? { ...p, pinned: !p.pinned } : p));
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    setProjects(prev => prev.filter(p => p._id !== id)); // optimistic
    await projectsApi.deleteProject(token!, id);
    setOpenMenu(null);
  };

  const pinned = projects.filter(p => p.pinned);
  const filtered = projects
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'progress') return b.progress - a.progress;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const inputCls = "w-full bg-cream-100 dark:bg-neutral-800 border border-cream-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-800 dark:text-cream-100 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 transition-all";

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
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-cream-100 tracking-tight">Projects Overview</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage and track your active workspace initiatives.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus size={15} /> Create New Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-cream-100 dark:bg-neutral-800 border border-cream-300 dark:border-neutral-700 rounded-lg hover:bg-cream-200 dark:hover:bg-neutral-700 transition-colors shadow-sm">
            <SlidersHorizontal size={13} /> Filter
          </button>
          <div className="relative">
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="appearance-none pl-8 pr-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-cream-100 dark:bg-neutral-800 border border-cream-300 dark:border-neutral-700 rounded-lg hover:bg-cream-200 dark:hover:bg-neutral-700 transition-colors shadow-sm outline-none cursor-pointer">
              <option value="recent">Sort by: Recent</option>
              <option value="name">Sort by: Name</option>
              <option value="progress">Sort by: Progress</option>
            </select>
            <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-2 bg-cream-100 dark:bg-neutral-800 border border-cream-300 dark:border-neutral-700 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary-400/30 transition-all w-64">
          <Search size={13} className="text-neutral-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
            className="bg-transparent outline-none text-sm text-neutral-700 dark:text-neutral-300 placeholder-neutral-400 flex-1" />
        </div>
      </div>

      {/* Pinned */}
      {pinned.length > 0 && !search && (
        <div className="mb-5">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Pin size={11} /> Pinned
          </p>
          <div className="flex gap-2 flex-wrap">
            {pinned.map(p => (
              <div key={p._id} className="flex items-center gap-2 bg-cream-100 dark:bg-neutral-800 border border-cream-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 shadow-sm">
                <span className={`w-2 h-2 rounded-full ${p.status === 'completed' ? 'bg-sage-400' : 'bg-primary-500'}`} />
                {p.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(project => {
          const s = statusConfig[project.status];
          const pc = progressColor[project.status];

          return (
            <div key={project._id}
              className={`relative bg-cream-100 dark:bg-neutral-900 rounded-2xl border border-cream-300 dark:border-neutral-800 border-l-4 ${project.accentColor} shadow-sm hover:shadow-md transition-all duration-200 p-5`}>
              {/* Menu */}
              <div className="absolute top-4 right-4">
                <button onClick={() => setOpenMenu(openMenu === project._id ? null : project._id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-cream-200 dark:hover:bg-neutral-800 transition-colors">
                  <MoreHorizontal size={14} />
                </button>
                {openMenu === project._id && (
                  <div className="absolute right-0 top-8 w-44 bg-cream-100 dark:bg-neutral-900 rounded-xl shadow-lg border border-cream-300 dark:border-neutral-700 z-10 overflow-hidden">
                    <button onClick={() => openEdit(project)}
                      className="w-full text-left px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-cream-200 dark:hover:bg-neutral-800 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handlePin(project._id)}
                      className="w-full text-left px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-cream-200 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2">
                      <Pin size={13} /> {project.pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <div className="border-t border-cream-300 dark:border-neutral-700">
                      <button onClick={() => handleDelete(project._id)}
                        className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${project.iconBg} flex items-center justify-center`}>
                  <span className="text-lg font-bold text-neutral-600 dark:text-neutral-400">{project.name[0]}</span>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
              </div>

              <h3 className="text-base font-bold text-neutral-800 dark:text-cream-100 mb-1.5 pr-6">{project.name}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2 mb-4">{project.description || 'No description.'}</p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-neutral-400 font-medium">Progress</span>
                  <span className={`text-xs font-bold ${project.status === 'completed' ? 'text-sage-500' : 'text-neutral-700 dark:text-neutral-300'}`}>{project.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-cream-300 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pc}`} style={{ width: `${project.progress}%` }} />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.members.slice(0, 3).map((m, i) => (
                    <div key={m._id} className={`w-7 h-7 rounded-full ${avatarColors[i % avatarColors.length]} border-2 border-cream-100 dark:border-neutral-900 flex items-center justify-center text-white text-[10px] font-bold`}>
                      {m.name[0].toUpperCase()}
                    </div>
                  ))}
                  {project.members.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-cream-300 dark:bg-neutral-700 border-2 border-cream-100 dark:border-neutral-900 flex items-center justify-center text-neutral-500 text-[10px] font-bold">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
                {project.dueDate ? (
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <Calendar size={11} />
                    {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                ) : project.status === 'completed' ? (
                  <span className="text-xs font-semibold text-sage-500">Archived</span>
                ) : (
                  <span className="text-xs text-neutral-400">Paused</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Add card */}
        <button onClick={openCreate}
          className="bg-cream-200 dark:bg-neutral-800 rounded-2xl border-2 border-dashed border-cream-400 dark:border-neutral-700 p-5 flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-950/10 transition-all group min-h-[220px]">
          <div className="w-10 h-10 rounded-full border-2 border-cream-400 dark:border-neutral-600 group-hover:border-primary-400 flex items-center justify-center transition-colors">
            <Plus size={18} className="text-neutral-400 group-hover:text-primary-500 transition-colors" />
          </div>
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">New Workspace</p>
          <p className="text-xs text-neutral-400 text-center px-4">Click to start a new project from scratch.</p>
        </button>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-cream-100 dark:bg-neutral-900 rounded-2xl shadow-xl border border-cream-300 dark:border-neutral-700 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-neutral-800 dark:text-cream-100">{editProject ? 'Edit Project' : 'Create New Project'}</h2>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-cream-200 dark:hover:bg-neutral-800 transition-colors">
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Project Name *</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Mobile App Redesign" required className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Description</label>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What is this project about?" rows={3} className={`${inputCls} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value as ProjectStatus)} className={inputCls}>
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Due Date</label>
                  <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-cream-200 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-60 rounded-xl transition-colors shadow-sm">
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  {editProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
