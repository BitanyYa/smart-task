import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../api/auth';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return; }

    verifyEmail(token)
      .then(r => { setStatus('success'); setMessage(r.data.message); })
      .catch(e => { setStatus('error'); setMessage(e.response?.data?.message || 'Verification failed.'); });
  }, [params]);

  return (
    <div className="min-h-screen bg-cream-200 flex items-center justify-center p-4">
      <div className="bg-cream-100 rounded-2xl shadow-xl border border-cream-300 w-full max-w-sm p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 size={40} className="text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-neutral-600">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 size={48} className="text-sage-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-neutral-800 mb-2">Email Verified!</h2>
            <p className="text-neutral-500 text-sm mb-6">{message}</p>
            <Link to="/login" className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors">
              Sign In
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-neutral-800 mb-2">Verification Failed</h2>
            <p className="text-neutral-500 text-sm mb-6">{message}</p>
            <Link to="/login" className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors">
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
