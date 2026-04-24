import { Link } from 'react-router-dom';
import {
  LayoutDashboard, BarChart2, Users, CheckCircle2,
  ArrowRight, Zap, Shield, Clock, Star, ChevronRight
} from 'lucide-react';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Intuitive Kanban Boards',
    desc: 'Visualize your progress with drag-and-drop simplicity. Organize tasks across To Do, In Progress, and Done with ease.',
    color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
  },
  {
    icon: BarChart2,
    title: 'Deep Analytics',
    desc: 'Identify bottlenecks and track velocity with real-time data visualizations and reports.',
    color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
  },
  {
    icon: Users,
    title: 'Seamless Team Collaboration',
    desc: 'Keep everyone aligned with integrated comments, file sharing, and shared milestones.',
    color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
  },
];

const highlights = [
  { icon: Zap,         label: 'Lightning Fast',    desc: 'Optimized for speed and performance' },
  { icon: Shield,      label: 'Secure by Default', desc: 'JWT auth and encrypted data' },
  { icon: Clock,       label: 'Time Tracking',     desc: 'Built-in timer for every task' },
  { icon: CheckCircle2,label: 'Smart Reminders',   desc: 'Never miss a deadline again' },
];

const stats = [
  { value: '10,000+', label: 'Teams' },
  { value: '2M+',     label: 'Tasks Completed' },
  { value: '99.9%',   label: 'Uptime' },
  { value: '4.9★',    label: 'User Rating' },
];

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">SmartTask</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
            <a href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</a>
            <a href="#about" className="hover:text-gray-900 dark:hover:text-white transition-colors">About</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 via-white to-white dark:from-blue-950/20 dark:via-gray-950 dark:to-gray-950 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Star size={11} className="fill-current" />
            NEW RELEASE — v2.0 is here
            <ChevronRight size={11} />
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight mb-6">
            Master Your Workflow<br />
            <span className="text-blue-600">with Precision</span>
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            The all-in-one task management platform built for high-performance teams.
            Reduce cognitive load and take back control of your day.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/register"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-xl hover:-translate-y-0.5">
              Start for Free
              <ArrowRight size={16} />
            </Link>
            <Link to="/login"
              className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              Make a Demo
            </Link>
          </div>
        </div>

        {/* App preview */}
        <div className="relative max-w-5xl mx-auto px-6 pb-20">
          <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl shadow-2xl shadow-gray-900/20 dark:shadow-black/40 overflow-hidden border border-gray-800">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 dark:bg-gray-700 border-b border-gray-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="flex-1 mx-4 bg-gray-700 dark:bg-gray-600 rounded-md h-5 flex items-center px-3">
                <span className="text-xs text-gray-400">app.smarttask.io/board</span>
              </div>
            </div>
            {/* Mock board */}
            <div className="p-6 bg-[#0f1117]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-white font-bold text-sm">Active Workspace</p>
                  <p className="text-gray-500 text-xs mt-0.5">4 tasks in progress</p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-gray-800 rounded-lg text-xs text-gray-400">Filter</div>
                  <div className="px-3 py-1 bg-gray-800 rounded-lg text-xs text-gray-400">Sort</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { col: 'To Do', color: 'bg-gray-500', tasks: [
                    { title: 'Design system audit', priority: 'High', p: 'text-blue-400' },
                    { title: 'Update brand guidelines', priority: 'Low', p: 'text-gray-400' },
                  ]},
                  { col: 'In Progress', color: 'bg-blue-500', tasks: [
                    { title: 'Refactor navigation', priority: 'Urgent', p: 'text-orange-400' },
                    { title: 'Design token mapping', priority: 'High', p: 'text-blue-400' },
                  ]},
                  { col: 'Done', color: 'bg-emerald-500', tasks: [
                    { title: 'User interview scripts', priority: 'Medium', p: 'text-gray-400' },
                  ]},
                ].map(col => (
                  <div key={col.col}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${col.color}`} />
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{col.col}</span>
                      <span className="text-xs text-gray-600 ml-auto">{col.tasks.length}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {col.tasks.map(t => (
                        <div key={t.title} className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                          <p className={`text-xs font-semibold mb-1.5 ${t.p}`}>{t.priority}</p>
                          <p className="text-xs text-gray-200 font-medium leading-snug">{t.title}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }} />
                            </div>
                            <div className="w-4 h-4 rounded-full bg-gray-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="border-y border-gray-100 dark:border-gray-800 py-10 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Trusted by over 10,000 teams worldwide
          </p>
          <div className="flex items-center justify-center gap-10 flex-wrap">
            {['Acme Corp', 'Vercel', 'Linear', 'Notion', 'Stripe'].map(name => (
              <span key={name} className="text-sm font-bold text-gray-300 dark:text-gray-600">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50/60 dark:bg-gray-900/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Engineered for Performance</p>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Built for individuals, powerful enough for enterprise.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon size={18} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {highlights.map(h => (
            <div key={h.label} className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <h.icon size={18} />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{h.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-3xl mx-auto bg-blue-600 rounded-3xl p-12 text-center shadow-2xl shadow-blue-200 dark:shadow-blue-900/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-80" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              Ready to boost your<br />productivity?
            </h2>
            <p className="text-blue-100 text-sm mb-8 max-w-md mx-auto">
              Join over 10,000 teams and start managing your tasks with surgical precision. Free for 14 days.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/register"
                className="bg-white text-blue-600 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-sm text-sm">
                Get Started Now
              </Link>
              <Link to="/login"
                className="border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm">
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t border-gray-100 dark:border-gray-800 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </div>
                <span className="font-bold text-sm text-gray-900 dark:text-white">SmartTask</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Built for great performance and elite task management. Think sharp, act fast, be the sharpest professional.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security'] },
              { title: 'Legal',   links: ['Privacy', 'Terms'] },
              { title: 'Connect', links: ['Twitter', 'GitHub', 'LinkedIn'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">{col.title}</p>
                <div className="flex flex-col gap-2">
                  {col.links.map(l => (
                    <a key={l} href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-gray-400">© 2024 SmartTask Inc. All rights reserved.</p>
            <p className="text-xs text-gray-400">Built for peak performance.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
