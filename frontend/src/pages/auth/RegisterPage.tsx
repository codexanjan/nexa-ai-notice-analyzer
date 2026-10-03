import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { UserRole } from '../../types';
import { Sparkles, User, Mail, Lock, Hash, ArrowRight, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        student_id: studentId || undefined,
        role,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 p-8 rounded-3xl glass-panel border border-white/15 bg-surface/90 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/40 flex items-center justify-center text-primary mx-auto shadow-glow-primary">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="font-display font-bold text-2xl text-white">Create NEXA Account</h1>
        <p className="text-xs text-muted">Join the AI Notice Intelligence Platform</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-critical/15 border border-critical/30 text-critical text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-mono text-muted block mb-1.5">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Chen"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50 transition font-sans"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-mono text-muted block mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@nexa.edu"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50 transition font-sans"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-mono text-muted block mb-1.5">Student / Staff ID</label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="CS-2026-042"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50 transition font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-muted block mb-1.5">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50"
            >
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Administrator</option>
              <option value="FACULTY">Faculty</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-mono text-muted block mb-1.5">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="password"
              required
              minLength={6}
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
              Register
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-muted">
          Already registered?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
