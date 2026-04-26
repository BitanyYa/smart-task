import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:4000/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
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
          {sent ? (
            <div className="text-center">
              <CheckCircle2 size={44} className="text-sage-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-neutral-800 mb-2">Check your inbox</h2>
              <p className="text-sm text-neutral-500 mb-6">
                If <strong>{email}</strong> has an account, we've sent a password reset link.
              </p>
              <Link to="/login" className="text-sm font-semibold text-primary-500 hover:underline flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-neutral-800 mb-1">Forgot password?</h2>
              <p className="text-sm text-neutral-500 mb-6">Enter your email and we'll send a reset link.</p>

              {error && <div className="mb-4 px-4 py-3 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-700">{error}</div>}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com" required className={inputCls} autoFocus />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  Send Reset Link
                </button>
              </form>

              <Link to="/login" className="mt-5 text-sm font-semibold text-neutral-500 hover:text-neutral-800 flex items-center justify-center gap-1 transition-colors">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
