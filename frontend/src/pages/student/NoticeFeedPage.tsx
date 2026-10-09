import React, { useState, useEffect, useCallback } from 'react';
import { NoticeCard } from '../../components/notices/NoticeCard';
import { NoticeFilters } from '../../components/notices/NoticeFilters';
import { noticeApi } from '../../services/noticeApi';
import { Notice } from '../../types';
import { FileText, Loader2, Sparkles } from 'lucide-react';

export const NoticeFeedPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [importance, setImportance] = useState('ALL');
  const [urgency, setUrgency] = useState('ALL');

  const fetchNotices = useCallback(async () => {
    try {
      const data = await noticeApi.getNotices({
        category: category !== 'ALL' ? category : undefined,
        importance: importance !== 'ALL' ? importance : undefined,
        urgency: urgency !== 'ALL' ? urgency : undefined,
        search: search || undefined,
        limit: 100,
      });
      setNotices(data);
      setError('');
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Could not refresh notices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, category, importance, urgency]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotices();
    }, 250);
    const interval = setInterval(fetchNotices, 15000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [fetchNotices]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('ALL');
    setImportance('ALL');
    setUrgency('ALL');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted"><span aria-live="polite">{error || (lastUpdated ? `Updated ${lastUpdated} · Refreshes every 15 seconds` : 'Connecting to notice feed…')}</span><button onClick={fetchNotices} className="text-primary underline">Refresh now</button></div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Structured Intelligence Feed</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Notice Feed & Intelligence Directory
          </h1>
        </div>
        <span className="text-xs font-mono text-muted bg-surface px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
          Showing {notices.length} notices
        </span>
      </div>

      {/* Filter and Search Bar */}
      <NoticeFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        importance={importance}
        onImportanceChange={setImportance}
        urgency={urgency}
        onUrgencyChange={setUrgency}
        onReset={handleResetFilters}
      />

      {/* Notices Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-xs font-mono text-muted">Querying AI Notice Database...</span>
        </div>
      ) : notices.length === 0 ? (
        <div className="p-16 text-center rounded-3xl glass-panel border border-white/10 space-y-3">
          <FileText className="w-12 h-12 text-muted mx-auto opacity-50" />
          <h3 className="font-display font-bold text-lg text-white">No notices match your criteria</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Try adjusting your search terms, changing the category filter, or resetting all filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition mt-2"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      )}
    </div>
  );
};
