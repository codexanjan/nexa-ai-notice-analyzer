import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../../services/analyticsApi';
import { AnalyticsData } from '../../types';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { ImportanceBarChart } from '../../components/charts/ImportanceBarChart';
import { TimelineAreaChart } from '../../components/charts/TimelineAreaChart';
import { BarChart2, PieChart, TrendingUp, Sparkles, Layers } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
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
        <span className="text-xs font-mono text-muted">Aggregating Institutional Analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="pb-2 border-b border-white/10">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          Institutional Analytics & Intelligence
        </h1>
        <p className="text-xs text-muted font-mono mt-1">
          Telemetry on classification categories, importance scores, and temporal distributions
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" />
            Notice Category Distribution
          </h3>
          <CategoryPieChart data={data?.categories || []} />
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-warning" />
            Importance Level Distribution
          </h3>
          <ImportanceBarChart data={data?.importance_distribution || []} />
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4 lg:col-span-2">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Notice Ingestion Timeline
          </h3>
          <TimelineAreaChart data={data?.timeline || []} />
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
        <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-info" />
          Complete Category Breakdown Table
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 font-mono uppercase text-muted text-[11px]">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Total Notices</th>
                <th className="py-3 px-4">Percentage Share</th>
                <th className="py-3 px-4">Relative Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {(data?.categories || []).map((cat) => (
                <tr key={cat.category} className="hover:bg-white/5 transition">
                  <td className="py-3 px-4 font-bold text-white font-mono">{cat.category}</td>
                  <td className="py-3 px-4 font-mono">{cat.count}</td>
                  <td className="py-3 px-4 font-mono text-primary font-semibold">{cat.percentage}%</td>
                  <td className="py-3 px-4 w-1/3">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(100, cat.percentage * 2)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
