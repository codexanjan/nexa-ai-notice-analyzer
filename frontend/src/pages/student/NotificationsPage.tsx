import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../../services/notificationApi';
import { NotificationItem } from '../../types';
import { Bell, Check, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      await notificationApi.markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }
    if (notif.notice_id) {
      navigate(`/notices/${notif.notice_id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase">
            <Bell className="w-3.5 h-3.5" />
            <span>High-Priority System Directives</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            In-App Notifications
          </h1>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-primary transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5" />
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-muted">Retrieving Notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-16 text-center rounded-3xl glass-panel border border-white/10 space-y-2">
          <Bell className="w-12 h-12 text-muted mx-auto opacity-40" />
          <h3 className="font-display font-bold text-lg text-white">No notifications</h3>
          <p className="text-xs text-muted">You are up to date on all critical announcements.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !notif.read
                  ? 'glass-panel border-critical/30 bg-critical/5 shadow-glow-critical'
                  : 'glass-panel border-white/5 bg-surface/40 hover:border-white/15'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    !notif.read
                      ? 'bg-critical/20 text-critical border border-critical/40'
                      : 'bg-white/5 text-muted border border-white/10'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-sm sm:text-base text-white">
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-critical animate-ping" />
                    )}
                  </div>
                  <p className="text-xs text-muted leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                  <span className="text-[10px] font-mono text-muted/70 block pt-1">
                    {notif.created_at ? notif.created_at.slice(0, 16).replace('T', ' ') : 'Just now'}
                  </span>
                </div>
              </div>

              {notif.notice_id && (
                <div className="flex items-center gap-1 text-xs font-semibold text-primary flex-shrink-0 self-center">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
