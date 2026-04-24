import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
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
      await register(name, email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white";

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        {/* Left — blue panel */}
        <div className="hidden lg:flex w-[55%] bg-blue-600 relative overflow-hidden flex-col justify-between p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
          <div className="absolute bottom-0 left-0 right-0 h-64 opacity-10">
            <svg viewBox="0 0 600 200" className="w-full" preserveAspectRatio="none">
              <rect x="60" y="40" width="80" height="160" rx="4" fill="white" opacity="0.6"/>
              <rect x="160" y="80" width="80" height="120" rx="4" fill="white" opacity="0.4"/>
              <rect x="260" y="20" width="80" height="180" rx="4" fill="white" opacity="0.6"/>
              <rect x="360" y="60" width="80" height="140" rx="4" fill="white" opacity="0.4"/>
              <rect x="460" y="100" width="80" height="100" rx="4" fill="white" opacity="0.3"/>
            </svg>
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 mb-16">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              <span className="text-white font-bold text-sm tracking-tight">SmartTask</span>
            </div>

            <div className="inline-flex items-center bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-8 tracking-wide">
              JOIN 10,000+ TEAMS
            </div>

            <h1 className="text-4xl font-extrabold text-white leading-tight mb-5">
              Start managing tasks<br />the smart way.
            </h1>

            <p className="text-blue-100 text-sm leading-relaxed max-w-sm mb-12">
              Create your free account and get access to Kanban boards, team collaboration, analytics, and more — all in one place.
            </p>

            <div className="flex gap-12">
              <div>
                <p className="text-2xl font-extrabold text-white">Free</p>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mt-0.5">No credit card</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">14 days</p>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mt-0.5">Pro trial included</p>
              </div>
            </div>
          </div>
          <div className="relative" />
        </div>

        {/* Right — form */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-20 bg-white">
          <div className="w-full max-w-sm mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
            <p className="text-sm text-gray-500 mb-8">Start your free workspace today.</p>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="John Doe" required className={inputCls} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com" required className={inputCls} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters" required minLength={6}
                    className={`${inputCls} pr-11`} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-1 text-sm">
                {loading && <Loader2 size={15} className="animate-spin" />}
                Create Account
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                  <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
                Microsoft
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">SmartTask</span>
          <span className="text-xs text-gray-400">© 2024 SmartTask. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="#" className="text-xs text-gray-500 hover:text-gray-800 transition-colors">Privacy Policy</a>
          <a href="#" className="text-xs text-gray-500 hover:text-gray-800 transition-colors">Terms of Service</a>
          <a href="#" className="text-xs text-gray-500 hover:text-gray-800 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
};
