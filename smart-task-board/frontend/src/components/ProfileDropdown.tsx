import { useRef, useEffect } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Page } from '../types/navigation';

interface Props {
  onNavigate: (page: Page) => void;
  onClose: () => void;
}

export const ProfileDropdown = ({ onNavigate, onClose }: Props) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  return (
    <div ref={ref} className="absolute right-0 top-10 w-56 bg-cream-100 dark:bg-neutral-900 rounded-xl shadow-lg border border-cream-300 dark:border-neutral-800 z-50 overflow-hidden">
      {/* User info */}
      <div className="px-4 py-3 border-b border-cream-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0]?.toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-800 dark:text-cream-100 truncate">{user?.name}</p>
            <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="py-1">
        <button
          onClick={() => { onNavigate('settings'); onClose(); }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-cream-200 dark:hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 transition-colors text-left"
        >
          <Settings size={14} className="text-neutral-400" />
          Settings
        </button>
        <button
          onClick={() => { onNavigate('profile'); onClose(); }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-cream-200 dark:hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 transition-colors text-left"
        >
          <User size={14} className="text-neutral-400" />
          View Profile
        </button>
      </div>

      <div className="border-t border-cream-200 dark:border-neutral-800 py-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
        >
          <LogOut size={14} />
          Log Out
        </button>
      </div>
    </div>
  );
};



