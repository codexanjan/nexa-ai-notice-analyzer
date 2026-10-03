import React, { useState, useEffect } from 'react';
import { analyticsApi, DeadlineCenterData } from '../../services/analyticsApi';
import { taskApi } from '../../services/taskApi';
import { LevelBadge } from '../../components/ui/Badge';
import {
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Bell,
  Check,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DeadlinesPage: React.FC = () => {
  const [data, setData] = useState<DeadlineCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [remindedItems, setRemindedItems] = useState<Record<string, boolean>>({});
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const fetchDeadlines = async () => {
    try {
      const res = await analyticsApi.getDeadlineCenter();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const handleMarkComplete = async (item: any) => {
    if (item.type === 'TASK') {
      try {
        await taskApi.updateTask(item.id, { status: 'Completed' });
        setCompletedItems((prev) => ({ ...prev, [item.id]: true }));
        fetchDeadlines();
      } catch (err) {
        console.error(err);
      }
    } else {
      setCompletedItems((prev) => ({ ...prev, [item.id]: true }));
    }
  };

  const handleAddReminder = (item: any) => {
    setRemindedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setRemindedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 3000);
  };

  const renderDeadlineSection = (
    title: string,
    items: any[],
    badgeColor: string,
    emptyMessage: string
  ) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${badgeColor}`} />
          {title} ({items.length})
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="p-6 rounded-2xl glass-panel border border-white/5 text-xs font-mono text-muted text-center">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, idx) => {
            const isCompleted = completedItems[item.id] || item.status === 'Completed';
            const hasReminder = remindedItems[item.id];

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl glass-panel border transition-all space-y-4 flex flex-col justify-between ${
                  isCompleted
                    ? 'border-white/5 opacity-60 bg-surface/40'
                    : 'border-white/10 hover:border-primary/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <LevelBadge level={item.urgency || 'MEDIUM'} />
                    <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      Score: {item.importance}/100
                    </span>
                  </div>

                  <h3 className={`font-display font-bold text-base text-white ${isCompleted ? 'line-through text-muted' : ''}`}>
                    {item.title}
                  </h3>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs font-mono text-muted">
                    <span className="flex items-center gap-1.5 text-warning font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {item.deadline}
                    </span>
                    <span className="text-[11px] uppercase">{item.status}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {item.notice_id && (
                      <Link
                        to={`/notices/${item.notice_id}`}
                        className="text-xs text-primary hover:underline flex items-center gap-1 font-mono"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Notice
                      </Link>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => handleAddReminder(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1 ${
                          hasReminder
                            ? 'bg-warning/20 border-warning text-warning'
                            : 'bg-white/5 border-white/10 text-muted hover:text-white'
                        }`}
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>{hasReminder ? 'Reminder Set!' : 'Add Reminder'}</span>
                      </button>

                      <button
                        onClick={() => handleMarkComplete(item)}
                        disabled={isCompleted}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-success/20 text-success border border-success/30'
                            : 'bg-primary hover:bg-primary-hover text-black'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Done' : 'Mark Complete'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase">
            <Clock className="w-3.5 h-3.5" />
            <span>Time-Sensitive Commitment Center</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Deadline Center
          </h1>
        </div>
        <span className="text-xs font-mono text-muted bg-surface px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
          {data?.total_active_deadlines || 0} Active Deadlines
        </span>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-muted">Calculating Time Pressure Bands...</span>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Due Today */}
          {renderDeadlineSection(
            'Due Today',
            data?.due_today || [],
            'bg-critical animate-ping',
            'No deadlines expiring today.'
          )}

          {/* Due This Week */}
          {renderDeadlineSection(
            'Due This Week',
            data?.due_this_week || [],
            'bg-warning',
            'No deadlines expiring this week.'
          )}

          {/* Upcoming */}
          {renderDeadlineSection(
            'Upcoming Deadlines',
            data?.upcoming || [],
            'bg-info',
            'No upcoming long-range deadlines.'
          )}

          {/* Completed */}
          {renderDeadlineSection(
            'Completed Actions',
            data?.completed || [],
            'bg-success',
            'No completed actions recorded.'
          )}
        </div>
      )}
    </div>
  );
};
