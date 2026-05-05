import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getInviteInfo, acceptInvite } from '../api/teams';
import { Loader2, Users, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AcceptInvitePage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [status, setStatus] = useState<'loading' | 'info' | 'accepting' | 'success' | 'error'>('loading');
  const [inviteInfo, setInviteInfo] = useState<{ teamName: string; email: string; role: string } | null>(null);
  const [message, setMessage] = useState('');

  const inviteToken = params.get('token');

  useEffect(() => {
    if (!inviteToken) { setStatus('error'); setMessage('Invalid invite link.'); return; }

    getInviteInfo(inviteToken)
      .then(info => { setInviteInfo(info); setStatus('info'); })
      .catch(e => { setStatus('error'); setMessage(e.response?.data?.message || 'Invalid or expired invite.'); });
  }, [inviteToken]);

  const handleAccept = async () => {
    if (!token) {
      // Not logged in — redirect to register with invite token
      navigate(`/register?invite=${inviteToken}`);
      return;
    }
    setStatus('accepting');
    try {
      await acceptInvite(inviteToken!);
      setStatus('success');
      setTimeout(() => navigate('/app'), 2500);
    } catch (e: any) {
      setStatus('error');
      setMessage(e.response?.data?.message || 'Failed to accept invite.');
    }
  };

  return (
    <div className="min-h-screen bg-cream-200 flex items-center justify-center p-4">
      <div className="bg-cream-100 rounded-2xl shadow-xl border border-cream-300 w-full max-w-sm p-8 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <span className="font-bold text-neutral-800 text-sm">SmartTask</span>
        </div>

        {status === 'loading' && (
          <>
            <Loader2 size={40} className="text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-neutral-500 text-sm">Loading invite...</p>
          </>
        )}

        {status === 'info' && inviteInfo && (
          <>
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-primary-500" />
            </div>
            <h2 className="text-xl font-bold text-neutral-800 mb-2">Team Invitation</h2>
            <p className="text-neutral-500 text-sm mb-1">You've been invited to join</p>
            <p className="text-lg font-bold text-primary-600 mb-1">{inviteInfo.teamName}</p>
            <p className="text-xs text-neutral-400 mb-6 capitalize">as a <strong>{inviteInfo.role}</strong></p>

            {user ? (
              user.email === inviteInfo.email ? (
                <button onClick={handleAccept}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-xl transition-colors shadow-sm text-sm">
                  Accept Invitation
                </button>
              ) : (
                <div className="text-sm text-neutral-500 bg-cream-200 rounded-xl p-3">
                  This invite was sent to <strong>{inviteInfo.email}</strong>.<br />
                  Please sign in with that email.
                </div>
              )
            ) : (
              <div className="flex flex-col gap-2">
                <Link to={`/login?invite=${inviteToken}`}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-xl transition-colors shadow-sm text-sm text-center">
                  Sign In to Accept
                </Link>
                <Link to={`/register?invite=${inviteToken}`}
                  className="w-full border border-cream-400 text-neutral-700 font-semibold py-3 rounded-xl hover:bg-cream-200 transition-colors text-sm text-center">
                  Create Account
                </Link>
              </div>
            )}
          </>
        )}

        {status === 'accepting' && (
          <>
            <Loader2 size={40} className="text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-neutral-500 text-sm">Joining team...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 size={48} className="text-sage-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-neutral-800 mb-2">Welcome to the team!</h2>
            <p className="text-neutral-500 text-sm">Redirecting to your workspace...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-neutral-800 mb-2">Invite Error</h2>
            <p className="text-neutral-500 text-sm mb-6">{message}</p>
            <Link to="/" className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
              Go Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
