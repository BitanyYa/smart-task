import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-cream-400 dark:border-neutral-700 rounded-lg px-4 py-3 text-sm text-neutral-800 dark:text-cream-100 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 transition-all bg-cream-100 dark:bg-neutral-900";

  return (
    <div className="min-h-screen flex flex-col bg-cream-200 dark:bg-neutral-950">
      <div className="flex flex-1">
        {/* Left — branded panel */}
        <div className="hidden lg:flex w-[55%] relative overflow-hidden flex-col justify-between p-12 bg-primary-500">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700" />
          {/* Decorative bars */}
          <div className="absolute bottom-0 left-0 right-0 h-64 opacity-10">
            <svg viewBox="0 0 600 200" className="w-full" preserveAspectRatio="none">
              <rect x="60"  y="40"  width="80" height="160" rx="4" fill="white" opacity="0.6"/>
              <rect x="160" y="80"  width="80" height="120" rx="4" fill="white" opacity="0.4"/>
              <rect x="260" y="20"  width="80" height="180" rx="4" fill="white" opacity="0.6"/>
              <rect x="360" y="60"  width="80" height="140" rx="4" fill="white" opacity="0.4"/>
              <rect x="460" y="100" width="80" height="100" rx="4" fill="white" opacity="0.3"/>
            </svg>
          </div>

          <div className="relative">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-16">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              <span className="text-white font-bold text-sm tracking-tight">SmartTask</span>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-8 tracking-wide uppercase">
              Version 2.0 Now Live
            </div>

            <h1 className="text-4xl font-extrabold text-white leading-tight mb-5">
              Master your workflow<br />with precision.
            </h1>

            <p className="text-primary-100 text-sm leading-relaxed max-w-sm mb-12">
              SmartTask helps professionals achieve calm control over their workload through disciplined task management and intelligent automation.
            </p>

            <div className="flex gap-12">
              <div>
                <p className="text-2xl font-extrabold text-white">99.9%</p>
                <p className="text-primary-200 text-xs font-semibold uppercase tracking-widest mt-0.5">Uptime Reliability</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">2.5M+</p>
                <p className="text-primary-200 text-xs font-semibold uppercase tracking-widest mt-0.5">Tasks Completed</p>
              </div>
            </div>
          </div>
          <div className="relative" />
        </div>

        {/* Right — form */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-20 bg-cream-200 dark:bg-neutral-950">
          <div className="w-full max-w-sm mx-auto">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-cream-100 mb-1">Sign In</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 dark:text-neutral-500 mb-8">Enter your credentials to access your workspace.</p>

            {error && (
              <div className="mb-5 px-4 py-3 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com" required className={inputCls} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-primary-500 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required className={`${inputCls} pr-11`} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:text-neutral-400 dark:text-neutral-500 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-1 text-sm shadow-sm">
                {loading && <Loader2 size={15} className="animate-spin" />}
                Sign In
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-cream-400" />
              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-wider">Or continue with</span>
              <div className="flex-1 h-px bg-cream-400" />
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 border border-cream-400 dark:border-neutral-700 rounded-lg py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-cream-300 dark:hover:bg-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:bg-neutral-800 transition-colors bg-cream-100 dark:bg-neutral-900">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 border border-cream-400 dark:border-neutral-700 rounded-lg py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-cream-300 dark:hover:bg-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:bg-neutral-800 transition-colors bg-cream-100 dark:bg-neutral-900">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                  <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
                Microsoft
              </button>
            </div>

            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 dark:text-neutral-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-500 font-bold hover:underline">Create an account</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-cream-400 dark:border-neutral-800 px-8 py-4 flex items-center justify-between bg-cream-200 dark:bg-neutral-950">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-neutral-800 dark:text-cream-100">SmartTask</span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500">© 2024 SmartTask. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="#" className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-cream-100 dark:text-cream-100 transition-colors">Privacy Policy</a>
          <a href="#" className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-cream-100 dark:text-cream-100 transition-colors">Terms of Service</a>
          <a href="#" className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-cream-100 dark:text-cream-100 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
};




