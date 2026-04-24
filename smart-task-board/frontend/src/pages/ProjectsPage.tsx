import { useState } from 'react';
import {
  Plus, Search, SlidersHorizontal, ArrowUpDown,
  ShoppingCart, Cloud, Palette, Smartphone, Shield,
  MoreHorizontal, Pin, Calendar
} from 'lucide-react';

type ProjectStatus = 'active' | 'on-hold' | 'completed';

type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  dueDate?: string;
  members: string[];
  icon: React.ElementType;
  iconBg: string;
  accentColor: string;
  pinned?: boolean;
};

const statusConfig: Record<ProjectStatus, { label: string; cls: string }> = {
  active:    { label: 'ACTIVE',    cls: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
  'on-hold': { label: 'ON HOLD',   cls: 'bg-orange-50 text-orange-500 dark:bg-orange-950/40 dark:text-orange-400' },
  completed: { label: 'COMPLETED', cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' },
};

const progressColor: Record<ProjectStatus, string> = {
  active:    'bg-blue-600',
  'on-hold': 'bg-orange-500',
  completed: 'bg-emerald-500',
};

const avatarColors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'];

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1', name: 'E-commerce Redesign',
    description: 'Complete overhaul of the checkout flow and mobile experience for Q4 sales.',
    status: 'active', progress: 75, dueDate: 'Dec 12',
    members: ['A', 'B', 'C'], icon: ShoppingCart,
    iconBg: 'bg-blue-100 dark:bg-blue-950/40', accentColor: 'border-l-blue-500', pinned: true,
  },
  {
    id: '2', name: 'Cloud Migration',
    description: 'Moving legacy database architecture to AWS serverless infrastructure.',
    status: 'on-hold', progress: 32, dueDate: undefined,
    members: ['D', 'E'], icon: Cloud,
    iconBg: 'bg-orange-100 dark:bg-orange-950/40', accentColor: 'border-l-orange-500',
  },
  {
    id: '3', name: 'Brand Style Guide',
    description: 'Defining the visual language and component library for SmartTask 2.0.',
    status: 'completed', progress: 100, dueDate: undefined,
    members: ['F'], icon: Palette,
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/40', accentColor: 'border-l-emerald-500', pinned: true,
  },
  {
    id: '4', name: 'Mobile App Beta',
    description: 'Testing core features with early adopters and collecting UX feedback.',
    status: 'active', progress: 58, dueDate: 'Jan 20',
    members: ['A', 'G'], icon: Smartphone,
    iconBg: 'bg-blue-100 dark:bg-blue-950/40', accentColor: 'border-l-blue-500',
  },
  {
    id: '5', name: 'Security Audit',
    description: 'Annual penetration testing and compliance verification for enterprise clients.',
    status: 'active', progress: 15, dueDate: 'Feb 05',
    members: ['H'], icon: Shield,
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/40', accentColor: 'border-l-indigo-500',
  },
];

export const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'progress'>('recent');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const pinned = projects.filter(p => p.pinned);
  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'progress') return b.progress - a.progress;
    return 0;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newProject: Project = {
      id: Date.now().toString(),
      name: newName.trim(),
      description: newDesc.trim() || 'No description yet.',
      status: 'active',
      progress: 0,
      members: ['U'],
      icon: Shield,
      iconBg: 'bg-blue-100 dark:bg-blue-950/40',
      accentColor: 'border-l-blue-500',
    };
    setProjects(prev => [newProject, ...prev]);
    setNewName('');
    setNewDesc('');
    setShowNewModal(false);
  };

  const togglePin = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, pinned: !p.pinned } : p));
    setOpenMenu(null);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setOpenMenu(null);
  };

  return (
    <div className="px-8 py-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Projects Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track your active workspace initiatives.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={15} />
          Create New Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
            <SlidersHorizontal size={13} /> Filter
          </button>
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="appearance-none flex items-center gap-1.5 pl-8 pr-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm outline-none cursor-pointer"
            >
              <option value="recent">Sort by: Recent</option>
              <option value="name">Sort by: Name</option>
              <option value="progress">Sort by: Progress</option>
            </select>
            <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-400/30 transition-all w-64">
          <Search size={13} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 flex-1"
          />
        </div>
      </div>

      {/* Pinned */}
      {pinned.length > 0 && !search && (
        <div className="mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Pin size={11} /> Pinned
          </p>
          <div className="flex gap-2 flex-wrap">
            {pinned.map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                <span className={`w-2 h-2 rounded-full ${p.status === 'completed' ? 'bg-emerald-400' : 'bg-blue-500'}`} />
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
          const Icon = project.icon;

          return (
            <div
              key={project.id}
              className={`relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 border-l-4 ${project.accentColor} shadow-sm hover:shadow-md transition-all duration-200 p-5`}
            >
              {/* Menu */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setOpenMenu(openMenu === project.id ? null : project.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <MoreHorizontal size={14} />
                </button>
                {openMenu === project.id && (
                  <div className="absolute right-0 top-8 w-40 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10 overflow-hidden">
                    <button onClick={() => togglePin(project.id)}
                      className="w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                      <Pin size={13} /> {project.pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button onClick={() => deleteProject(project.id)}
                      className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Icon + status */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${project.iconBg} flex items-center justify-center`}>
                  <Icon size={20} className="text-gray-600 dark:text-gray-400" />
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
              </div>

              {/* Name + desc */}
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5 pr-6">{project.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">{project.description}</p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400 font-medium">Progress</span>
                  <span className={`text-xs font-bold ${project.status === 'completed' ? 'text-emerald-500' : 'text-gray-700 dark:text-gray-300'}`}>
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pc}`} style={{ width: `${project.progress}%` }} />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.members.slice(0, 3).map((m, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${avatarColors[i % avatarColors.length]} border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-[10px] font-bold`}>
                      {m}
                    </div>
                  ))}
                  {project.members.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center text-gray-600 dark:text-gray-400 text-[10px] font-bold">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
                {project.dueDate ? (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={11} />
                    Due {project.dueDate}
                  </div>
                ) : project.status === 'completed' ? (
                  <span className="text-xs font-semibold text-emerald-500">Archived</span>
                ) : (
                  <span className="text-xs text-gray-400">Paused</span>
                )}
              </div>
            </div>
          );
        })}

        {/* New Workspace card */}
        <button
          onClick={() => setShowNewModal(true)}
          className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-5 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-all group min-h-[220px]"
        >
          <div className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-blue-400 flex items-center justify-center transition-colors">
            <Plus size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">New Workspace</p>
          <p className="text-xs text-gray-400 text-center px-4">Click to start a new project from a template or scratch.</p>
        </button>
      </div>

      {/* Create modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm" onClick={() => setShowNewModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">Create New Project</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project Name</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Mobile App Redesign" required
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-300 transition-all text-gray-800 dark:text-gray-200 placeholder-gray-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</label>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What is this project about?" rows={3}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-300 transition-all resize-none text-gray-800 dark:text-gray-200 placeholder-gray-400" />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
