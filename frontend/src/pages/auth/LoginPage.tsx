import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { Sparkles, Lock, Mail, ArrowRight, AlertCircle, Shield, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillStudentDemo = () => {
    setEmail('student@nexa.edu');
    setPassword('student123');
    setError(null);
  };

  const fillAdminDemo = () => {
    setEmail('admin@nexa.edu');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto my-8 p-8 rounded-3xl glass-panel border border-white/15 bg-surface/90 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/40 flex items-center justify-center text-primary mx-auto shadow-glow-primary">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="font-display font-bold text-2xl text-white">Sign In to NEXA</h1>
        <p className="text-xs text-muted">AI Notice Intelligence System</p>
      </div>

      {/* Quick Demo Credentials Bar */}
      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
        <span className="text-[11px] font-mono text-muted uppercase tracking-wider block text-center">
          Quick Demo Credentials
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={fillStudentDemo}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-surface border border-white/10 hover:border-primary/40 text-xs font-semibold text-gray-200 transition"
          >
            <User className="w-3.5 h-3.5 text-primary" />
            Student Demo
          </button>
          <button
            type="button"
            onClick={fillAdminDemo}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-surface border border-white/10 hover:border-warning/40 text-xs font-semibold text-gray-200 transition"
          >
            <Shield className="w-3.5 h-3.5 text-warning" />
            Admin Demo
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-critical/15 border border-critical/30 text-critical text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-mono text-muted block mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@nexa.edu"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50 transition font-sans"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-mono text-muted block mb-1.5">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50 transition font-sans"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-xs tracking-wider uppercase transition shadow-glow-primary disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-muted">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-primary hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
