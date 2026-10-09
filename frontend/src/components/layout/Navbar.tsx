import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { notificationApi } from '../../services/notificationApi';
import { NotificationItem } from '../../types';
import {
  Bell,
  Sparkles,
  LayoutDashboard,
  FileText,
  Clock,
  CheckSquare,
  Shield,
  UploadCloud,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Plus
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) { return; }
    const fetchNotifications = async () => {
      try {
        const notifs = await notificationApi.getNotifications();
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.read).length);
      } catch (err) {
        // silent fallback
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = isAdmin ? [
    { label: 'Admin', path: '/admin', icon: Shield },
    { label: 'Manage', path: '/admin/notices', icon: FileText },
    { label: 'Create', path: '/admin/create', icon: Plus },
    { label: 'Analytics', path: '/admin/analytics', icon: LayoutDashboard },
  ] : user ? [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Notices', path: '/notices', icon: FileText },
    { label: 'Deadlines', path: '/deadlines', icon: Clock },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  ] : [{ label: 'Notice preview', path: '/notices', icon: FileText }];

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/nexa-logo.svg"
                alt="NEXA AI Logo"
                className="w-9 h-9 rounded-xl shadow-glow-primary group-hover:scale-105 transition-all duration-300"
              />
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-white tracking-wider flex items-center gap-1.5">
                  NEXA
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                    AI
                  </span>
                </span>
                <span className="text-[10px] font-mono text-muted tracking-wide hidden sm:inline">
                  Read Less. Know More.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      active
                        ? 'bg-primary/15 text-primary border border-primary/30 shadow-glow-primary'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Upload Notice Button */}
            {isAdmin && <Link
              to="/admin/upload"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-black text-xs font-bold tracking-wide transition shadow-glow-primary"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Notice</span>
            </Link>}

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 border border-white/5 transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-critical animate-ping" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-critical text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel border border-white/15 bg-surface/95 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <span className="font-display font-bold text-sm text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      In-App Intelligence Alerts
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2.5">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-muted text-center py-6 font-mono">
                        No notifications currently.
                      </p>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setShowNotifDropdown(false);
                            if (n.notice_id) navigate(`/notices/${n.notice_id}`);
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                            !n.read
                              ? 'bg-critical/10 border-critical/30 hover:bg-critical/20'
                              : 'bg-white/5 border-white/5 hover:bg-white/10 text-muted'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-white mb-1">
                            <span className="truncate">{n.title}</span>
                            {n.importance_score && (
                              <span className="text-[10px] font-mono text-primary ml-2 flex-shrink-0">
                                {n.importance_score}/100
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-300 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="pt-3 border-t border-white/10 text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifDropdown(false)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View all notification records →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Logout */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-surface border border-white/20 flex items-center justify-center text-primary font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-white leading-tight">{user.name}</span>
                    <span className="text-[10px] font-mono text-muted">{user.role}</span>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-muted hover:text-critical hover:bg-white/5 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-white hover:bg-white/5 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-xl bg-primary text-black text-xs font-bold transition hover:bg-primary-hover shadow-glow-primary"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 space-y-2 border-t border-white/10 bg-surface/95 backdrop-blur-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  active ? 'bg-primary/15 text-primary' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          {isAdmin && <Link
            to="/admin/upload"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 rounded-xl bg-primary text-black text-xs font-bold"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Notice
          </Link>}
        </div>
      )}
    </nav>
  );
};
