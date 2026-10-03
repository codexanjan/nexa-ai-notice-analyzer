import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../../services/analyticsApi';
import { AnalyticsData } from '../../types';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { ImportanceBarChart } from '../../components/charts/ImportanceBarChart';
import { TimelineAreaChart } from '../../components/charts/TimelineAreaChart';
import {
  Shield,
  UploadCloud,
  FilePlus,
  Flame,
  AlertTriangle,
  Clock,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const stats = await analyticsApi.getDashboard();
        setData(stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-muted">Aggregating Institutional Telemetry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase">
            <Shield className="w-3.5 h-3.5" />
            <span>Campus Administrative Intelligence</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Admin Intelligence Control Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/create"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition"
          >
            <FilePlus className="w-4 h-4 text-primary" />
            <span>Create Notice</span>
          </Link>
          <Link
            to="/admin/upload"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-black text-xs font-bold transition shadow-glow-primary"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </Link>
        </div>
      </div>

      {/* 5 KEY METRICS CARDS (Section 19) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">Total Notices</span>
          <div className="font-display font-bold text-3xl text-white mt-1">
            {data?.total_notices || 0}
          </div>
          <span className="text-[10px] text-muted font-mono mt-1 block">In Circulation</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-critical/30 bg-critical/5 shadow-glow-critical">
          <span className="text-[10px] font-mono text-critical uppercase tracking-wider block">Critical Notices</span>
          <div className="font-display font-bold text-3xl text-critical mt-1">
            {data?.critical_notices || 0}
          </div>
          <span className="text-[10px] text-critical/80 font-mono mt-1 block">Requires Action</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-warning/30 bg-warning/5">
          <span className="text-[10px] font-mono text-warning uppercase tracking-wider block">High Priority</span>
          <div className="font-display font-bold text-3xl text-warning mt-1">
            {data?.high_priority || 0}
          </div>
          <span className="text-[10px] text-warning/80 font-mono mt-1 block">Score 61–80</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-primary/30 bg-primary/5">
          <span className="text-[10px] font-mono text-primary uppercase tracking-wider block">Upcoming Deadlines</span>
          <div className="font-display font-bold text-3xl text-primary mt-1">
            {data?.upcoming_deadlines || 0}
          </div>
          <span className="text-[10px] text-primary/80 font-mono mt-1 block">Pending Close</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">Notices This Week</span>
          <div className="font-display font-bold text-3xl text-white mt-1">
            {data?.notices_this_week || 0}
          </div>
          <span className="text-[10px] text-muted font-mono mt-1 block">Processed Cycle</span>
        </div>
      </div>

      {/* CHARTS GRID (Section 19) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notice Category Distribution */}
        <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-primary" />
              Category Distribution
            </h3>
            <span className="text-[11px] font-mono text-muted">19 Academic Classes</span>
          </div>
          <CategoryPieChart data={data?.categories || []} />
        </div>

        {/* Importance Score Distribution */}
        <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-warning" />
              Importance Distribution
            </h3>
            <span className="text-[11px] font-mono text-muted">0–100 Mathematical Engine</span>
          </div>
          <ImportanceBarChart data={data?.importance_distribution || []} />
        </div>

        {/* Notices Timeline Over Time */}
        <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Notices Published Over Time & Critical Alerts
            </h3>
            <span className="text-[11px] font-mono text-muted">Activity Telemetry</span>
          </div>
          <TimelineAreaChart data={data?.timeline || []} />
        </div>
      </div>
    </div>
  );
};
