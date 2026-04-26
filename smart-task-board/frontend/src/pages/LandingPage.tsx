import { Link } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Users, CheckCircle2, ArrowRight, Zap, Shield, Clock, Star, ChevronRight } from 'lucide-react';

const features = [
  { icon: LayoutDashboard, title: 'Intuitive Kanban Boards',       desc: 'Visualize your progress with drag-and-drop simplicity. Organize tasks across Backlog, In Progress, and Done.',  color: 'bg-primary-100 text-primary-600' },
  { icon: BarChart2,       title: 'Deep Analytics',                 desc: 'Identify bottlenecks and track velocity with real-time data visualizations and reports.',                        color: 'bg-sage-100 text-sage-600' },
  { icon: Users,           title: 'Seamless Team Collaboration',    desc: 'Keep everyone aligned with integrated comments, file sharing, and shared milestones.',                           color: 'bg-cream-300 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 dark:text-neutral-500' },
];

const highlights = [
  { icon: Zap,          label: 'Lightning Fast',    desc: 'Optimized for speed and performance' },
  { icon: Shield,       label: 'Secure by Default', desc: 'JWT auth and encrypted data' },
  { icon: Clock,        label: 'Time Tracking',     desc: 'Built-in timer for every task' },
  { icon: CheckCircle2, label: 'Smart Reminders',   desc: 'Never miss a deadline again' },
];

const stats = [
  { value: '10,000+', label: 'Teams' },
  { value: '2M+',     label: 'Tasks Completed' },
  { value: '99.9%',   label: 'Uptime' },
  { value: '4.9★',    label: 'User Rating' },
];

export const LandingPage = () => (
  <div className="min-h-screen bg-cream-200 dark:bg-neutral-950 text-neutral-800 dark:text-cream-100">

    {/* Navbar */}
    <nav className="sticky top-0 z-50 bg-cream-200 dark:bg-neutral-950/90 backdrop-blur-md border-b border-cream-400 dark:border-neutral-700">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <span className="font-bold text-neutral-800 dark:text-cream-100 text-sm tracking-tight">SmartTask</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
          <a href="#features" className="hover:text-neutral-800 dark:hover:text-cream-100 dark:text-cream-100 transition-colors">Features</a>
          <a href="#pricing"  className="hover:text-neutral-800 dark:hover:text-cream-100 dark:text-cream-100 transition-colors">Pricing</a>
          <a href="#about"    className="hover:text-neutral-800 dark:hover:text-cream-100 dark:text-cream-100 transition-colors">About</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-cream-100 dark:text-cream-100 transition-colors">Sign In</Link>
          <Link to="/register" className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">Get Started</Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/60 via-cream-200 to-cream-200 dark:from-primary-900/10 dark:via-neutral-950 dark:to-neutral-950 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Star size={11} className="fill-current" />
          NEW RELEASE — v2.0 is here
          <ChevronRight size={11} />
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-neutral-800 dark:text-cream-100 leading-tight tracking-tight mb-6">
          Master Your Workflow<br />
          <span className="text-primary-500">with Precision</span>
        </h1>

        <p className="text-lg text-neutral-500 dark:text-neutral-400 dark:text-neutral-500 max-w-xl mx-auto mb-10 leading-relaxed">
          The all-in-one task management platform built for high-performance teams.
          Reduce cognitive load and take back control of your day.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link to="/register"
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-primary-200 hover:shadow-lg hover:-translate-y-0.5">
            Start for Free <ArrowRight size={16} />
          </Link>
          <Link to="/login"
            className="flex items-center gap-2 bg-cream-100 dark:bg-neutral-900 border border-cream-400 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold px-6 py-3 rounded-xl hover:bg-cream-300 dark:hover:bg-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:bg-neutral-800 transition-colors shadow-sm">
            Make a Demo
          </Link>
        </div>
      </div>

      {/* App preview — dark mock board kept intentionally dark for contrast */}
      <div className="relative max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden border border-neutral-800">
          <div className="flex items-center gap-2 px-4 py-3 bg-neutral-800 border-b border-neutral-700">
            <div className="w-3 h-3 rounded-full bg-primary-500" />
            <div className="w-3 h-3 rounded-full bg-cream-400" />
            <div className="w-3 h-3 rounded-full bg-sage-400" />
            <div className="flex-1 mx-4 bg-neutral-700 rounded-md h-5 flex items-center px-3">
              <span className="text-xs text-neutral-400 dark:text-neutral-500">app.smarttask.io/board</span>
            </div>
          </div>
          <div className="p-6 bg-neutral-900">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-cream-100 font-bold text-sm">Active Workspace</p>
                <p className="text-neutral-500 dark:text-neutral-400 dark:text-neutral-500 text-xs mt-0.5">4 tasks in progress</p>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-neutral-800 rounded-lg text-xs text-neutral-400 dark:text-neutral-500">Filter</div>
                <div className="px-3 py-1 bg-neutral-800 rounded-lg text-xs text-neutral-400 dark:text-neutral-500">Sort</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { col: 'Backlog',     dot: 'bg-neutral-400', tasks: [{ title: 'Design system audit', p: 'text-primary-400', priority: 'High' }, { title: 'Update brand guidelines', p: 'text-neutral-400 dark:text-neutral-500', priority: 'Low' }] },
                { col: 'In Progress', dot: 'bg-primary-500', tasks: [{ title: 'Refactor navigation', p: 'text-primary-400', priority: 'Urgent' }, { title: 'Design token mapping', p: 'text-sage-400', priority: 'High' }] },
                { col: 'Ready',       dot: 'bg-sage-500',    tasks: [{ title: 'User interview scripts', p: 'text-neutral-400 dark:text-neutral-500', priority: 'Medium' }] },
              ].map(col => (
                <div key={col.col}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{col.col}</span>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400 dark:text-neutral-500 ml-auto">{col.tasks.length}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {col.tasks.map(t => (
                      <div key={t.title} className="bg-neutral-800 rounded-xl p-3 border border-neutral-700">
                        <p className={`text-xs font-semibold mb-1.5 ${t.p}`}>{t.priority}</p>
                        <p className="text-xs text-cream-200 font-medium leading-snug">{t.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="w-12 h-1 bg-neutral-700 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 rounded-full" style={{ width: '60%' }} />
                          </div>
                          <div className="w-4 h-4 rounded-full bg-primary-500 opacity-60" />
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
    <section className="border-y border-cream-400 dark:border-neutral-700 py-10 bg-cream-300 dark:bg-neutral-800/50">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-6">Trusted by over 10,000 teams worldwide</p>
        <div className="flex items-center justify-center gap-10 flex-wrap">
          {['Acme Corp', 'Vercel', 'Linear', 'Notion', 'Stripe'].map(name => (
            <span key={name} className="text-sm font-bold text-cream-500 dark:text-neutral-600">{name}</span>
          ))}
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="py-16 max-w-4xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className="text-center">
            <p className="text-3xl font-extrabold text-neutral-800 dark:text-cream-100 mb-1">{s.value}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 dark:text-neutral-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Features */}
    <section id="features" className="py-20 bg-cream-300 dark:bg-neutral-800/40">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-3">Engineered for Performance</p>
          <h2 className="text-3xl font-extrabold text-neutral-800 dark:text-cream-100 tracking-tight">Built for individuals, powerful enough for enterprise.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="bg-cream-100 dark:bg-neutral-900 rounded-2xl border border-cream-300 dark:border-neutral-800 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}><f.icon size={18} /></div>
              <h3 className="text-base font-bold text-neutral-800 dark:text-cream-100 mb-2">{f.title}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 dark:text-neutral-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Highlights */}
    <section className="py-20 max-w-5xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {highlights.map(h => (
          <div key={h.label} className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl border border-cream-300 dark:border-neutral-800 hover:border-primary-300 transition-colors bg-cream-100 dark:bg-neutral-900">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500"><h.icon size={18} /></div>
            <p className="text-sm font-bold text-neutral-800 dark:text-cream-100">{h.label}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">{h.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA — uses primary-500 with cream buttons */}
    <section id="pricing" className="py-20 px-6">
      <div className="max-w-3xl mx-auto rounded-3xl p-12 text-center shadow-xl shadow-primary-200 relative overflow-hidden bg-primary-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700" />
        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
            Ready to boost your<br />productivity?
          </h2>
          <p className="text-primary-100 text-sm mb-8 max-w-md mx-auto">
            Join over 10,000 teams and start managing your tasks with surgical precision. Free for 14 days.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/register"
              className="bg-cream-100 dark:bg-neutral-900 text-primary-600 font-bold px-6 py-3 rounded-xl hover:bg-cream-200 dark:hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:bg-neutral-950 transition-colors shadow-sm text-sm">
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
    <footer id="about" className="border-t border-cream-400 dark:border-neutral-700 py-12 px-6 bg-cream-200 dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-primary-500 flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              <span className="font-bold text-sm text-neutral-800 dark:text-cream-100">SmartTask</span>
            </div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed">Built for great performance and elite task management.</p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Security'] },
            { title: 'Legal',   links: ['Privacy', 'Terms'] },
            { title: 'Connect', links: ['Twitter', 'GitHub', 'LinkedIn'] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-xs font-bold text-neutral-800 dark:text-cream-100 uppercase tracking-wider mb-3">{col.title}</p>
              <div className="flex flex-col gap-2">
                {col.links.map(l => (
                  <a key={l} href="#" className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-cream-100 dark:text-cream-100 transition-colors">{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-cream-400 dark:border-neutral-700 pt-6 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">© 2024 SmartTask Inc. All rights reserved.</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">Built for peak performance.</p>
        </div>
      </div>
    </footer>
  </div>
);




