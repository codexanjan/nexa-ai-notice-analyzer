import React from 'react';
import { useAuth } from '../../store/authStore';
import { User, Mail, Hash, Shield, LogOut, Sparkles } from 'lucide-react';
import { LevelBadge } from '../../components/ui/Badge';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-2 border-b border-white/10">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          Account Profile
        </h1>
        <p className="text-xs text-muted font-mono mt-1">
          Identity and authentication credentials
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/40 flex items-center justify-center text-primary font-display font-bold text-2xl shadow-glow-primary">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-muted">{user.email}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-primary uppercase font-bold">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-1">
            <span className="text-muted flex items-center gap-1.5 text-[11px]">
              <User className="w-3.5 h-3.5 text-primary" /> Full Name
            </span>
            <span className="font-semibold text-white text-sm block">{user.name}</span>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-1">
            <span className="text-muted flex items-center gap-1.5 text-[11px]">
              <Mail className="w-3.5 h-3.5 text-info" /> Email Address
            </span>
            <span className="font-semibold text-white text-sm block">{user.email}</span>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-1">
            <span className="text-muted flex items-center gap-1.5 text-[11px]">
              <Hash className="w-3.5 h-3.5 text-warning" /> Student / Staff ID
            </span>
            <span className="font-semibold text-white text-sm block">
              {user.student_id || 'Not Assigned'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-1">
            <span className="text-muted flex items-center gap-1.5 text-[11px]">
              <Shield className="w-3.5 h-3.5 text-critical" /> Platform Role
            </span>
            <span className="font-semibold text-white text-sm block">{user.role}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[11px] font-mono text-muted">
            Strict MVP Privacy Guarantee: No behavioral or personal tracking data collected.
          </span>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-critical/15 hover:bg-critical/25 text-critical border border-critical/30 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
