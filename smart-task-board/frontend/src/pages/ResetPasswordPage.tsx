import { useState, type FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const token = params.get('token');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) { setError('Invalid reset link.'); return; }
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:4000/api/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-cream-400 rounded-lg px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 transition-all bg-cream-100";

  return (
    <div className="min-h-screen bg-cream-200 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <span className="font-bold text-neutral-800 text-sm">SmartTask</span>
        </div>

        <div className="bg-cream-100 rounded-2xl shadow-xl border border-cream-300 p-8">
          {done ? (
            <div className="text-center">
              <CheckCircle2 size={44} className="text-sage-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-neutral-800 mb-2">Password Reset!</h2>
              <p className="text-sm text-neutral-500">Redirecting you to sign in...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-neutral-800 mb-1">Set new password</h2>
              <p className="text-sm text-neutral-500 mb-6">Choose a strong password for your account.</p>

              {error && <div className="mb-4 px-4 py-3 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-700">{error}</div>}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">New Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters" required minLength={6}
                      className={`${inputCls} pr-11`} autoFocus />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  Reset Password
                </button>
              </form>

              <Link to="/login" className="mt-5 text-sm font-semibold text-neutral-500 hover:text-neutral-800 flex items-center justify-center gap-1 transition-colors">
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
