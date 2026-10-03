import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NoticeCard } from '../../components/notices/NoticeCard';
import { Notice, AnalyticsData } from '../../types';
import { noticeApi } from '../../services/noticeApi';
import { analyticsApi, DeadlineCenterData } from '../../services/analyticsApi';
import {
  AlertTriangle,
  Flame,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  Layers,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [deadlinesData, setDeadlinesData] = useState<DeadlineCenterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [noticesData, statsData, deadData] = await Promise.all([
          noticeApi.getNotices({ limit: 12 }),
          analyticsApi.getDashboard(),
          analyticsApi.getDeadlineCenter(),
        ]);
        setNotices(noticesData);
        setAnalytics(statsData);
        setDeadlinesData(deadData);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const criticalNotices = notices.filter((n) => n.importance_level === 'CRITICAL');
  const highNotices = notices.filter((n) => n.importance_level === 'HIGH');

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Notice Intelligence Feed</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            What Are The Important Notices?
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/notices"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition"
          >
            <span>Browse All Notices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* METRIC CARDS (Total, Critical, High, Medium, Low, Deadlines) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Notices */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10">
          <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">Total Notices</span>
          <div className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
            {analytics?.total_notices || notices.length}
          </div>
          <span className="text-[10px] text-muted font-mono mt-1 block">Active In System</span>
        </div>

        {/* Critical Notices */}
        <div className="p-4 rounded-2xl glass-panel border border-critical/30 bg-critical/5 shadow-glow-critical">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-critical uppercase tracking-wider">Critical</span>
            <span className="w-2 h-2 rounded-full bg-critical animate-ping" />
          </div>
          <div className="font-display font-bold text-2xl sm:text-3xl text-critical mt-1">
            {analytics?.critical_notices || criticalNotices.length}
          </div>
          <span className="text-[10px] text-critical/80 font-mono mt-1 block">Score 81–100</span>
        </div>

        {/* High Notices */}
        <div className="p-4 rounded-2xl glass-panel border border-warning/30 bg-warning/5">
          <span className="text-[10px] font-mono text-warning uppercase tracking-wider block">High</span>
          <div className="font-display font-bold text-2xl sm:text-3xl text-warning mt-1">
            {analytics?.high_priority || highNotices.length}
          </div>
          <span className="text-[10px] text-warning/80 font-mono mt-1 block">Score 61–80</span>
        </div>

        {/* Medium Notices */}
        <div className="p-4 rounded-2xl glass-panel border border-info/30 bg-info/5">
          <span className="text-[10px] font-mono text-info uppercase tracking-wider block">Medium</span>
          <div className="font-display font-bold text-2xl sm:text-3xl text-info mt-1">
            {analytics?.medium_priority || 0}
          </div>
          <span className="text-[10px] text-info/80 font-mono mt-1 block">Score 31–60</span>
        </div>

        {/* Low Notices */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10">
          <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">Low</span>
          <div className="font-display font-bold text-2xl sm:text-3xl text-gray-400 mt-1">
            {analytics?.low_priority || 0}
          </div>
          <span className="text-[10px] text-muted font-mono mt-1 block">Score 0–30</span>
        </div>

        {/* Upcoming Deadlines */}
        <div className="p-4 rounded-2xl glass-panel border border-primary/30 bg-primary/5 shadow-glow-primary">
          <span className="text-[10px] font-mono text-primary uppercase tracking-wider block">Upcoming Due</span>
          <div className="font-display font-bold text-2xl sm:text-3xl text-primary mt-1">
            {deadlinesData?.total_active_deadlines || 0}
          </div>
          <span className="text-[10px] text-primary/80 font-mono mt-1 block">Pending Actions</span>
        </div>
      </div>

      {/* CRITICAL URGENT ACTION BANNER */}
      {criticalNotices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 sm:p-6 rounded-3xl bg-critical/10 border border-critical/40 shadow-glow-critical flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-critical/20 border border-critical/50 flex items-center justify-center text-critical flex-shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-critical uppercase tracking-wider">
                  Critical Immediate Priority Alert
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-critical text-white font-bold">
                  Score {criticalNotices[0].importance}/100
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-white mt-1">
                {criticalNotices[0].title}
              </h3>
              <p className="text-xs text-gray-300 mt-1 line-clamp-2 max-w-3xl">
                {criticalNotices[0].summary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 self-end md:self-center">
            <Link
              to={`/notices/${criticalNotices[0].id}`}
              className="px-5 py-2.5 rounded-xl bg-critical hover:bg-critical/90 text-white font-bold text-xs tracking-wide transition shadow-lg flex items-center gap-1.5"
            >
              <span>View Full Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* TWO COLUMN GRID: RECENT NOTICES & UPCOMING DEADLINES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Priority Notices */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-warning" />
              Prioritized Notice Feed
            </h2>
            <Link to="/notices" className="text-xs text-primary hover:underline font-mono">
              View all ({notices.length}) →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 rounded-2xl glass-panel animate-pulse" />
              ))}
            </div>
          ) : notices.length === 0 ? (
            <div className="p-12 text-center rounded-2xl glass-panel border border-white/10 font-mono text-muted text-xs">
              No notices published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notices.slice(0, 6).map((notice) => (
                <NoticeCard key={notice.id} notice={notice} />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Upcoming Deadlines & Action Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Upcoming Deadlines
            </h2>
            <Link to="/deadlines" className="text-xs text-primary hover:underline font-mono">
              Deadline Center →
            </Link>
          </div>

          <div className="space-y-3">
            {deadlinesData?.due_today && deadlinesData.due_today.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-critical uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-critical animate-ping" />
                  Due Today
                </span>
                {deadlinesData.due_today.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-critical/10 border border-critical/30 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-white">
                      <span className="truncate">{item.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-critical text-white">
                        {item.importance}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span>{item.deadline}</span>
                      <span className="text-critical font-semibold uppercase">{item.urgency}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {deadlinesData?.due_this_week && deadlinesData.due_this_week.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono text-warning uppercase font-bold tracking-wider">
                  Due This Week
                </span>
                {deadlinesData.due_this_week.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-surface/80 border border-white/10 space-y-1.5 text-xs hover:border-warning/30 transition"
                  >
                    <div className="flex items-center justify-between font-bold text-white">
                      <span className="truncate">{item.title}</span>
                      <span className="text-[10px] font-mono text-warning">
                        {item.importance}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span>{item.deadline}</span>
                      <span className="text-warning uppercase font-semibold">{item.urgency}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(!deadlinesData?.due_today || deadlinesData.due_today.length === 0) &&
             (!deadlinesData?.due_this_week || deadlinesData.due_this_week.length === 0) && (
              <div className="p-8 text-center rounded-2xl glass-panel border border-white/10 text-xs font-mono text-muted space-y-2">
                <CheckCircle2 className="w-8 h-8 text-success mx-auto opacity-60" />
                <p>All deadlines cleared for the week!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
