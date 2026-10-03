import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { noticeApi } from '../../services/noticeApi';
import { Notice } from '../../types';
import { CategoryBadge, LevelBadge } from '../../components/ui/Badge';
import {
  FileText,
  Trash2,
  ExternalLink,
  Plus,
  UploadCloud,
  Search,
  Filter,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const NoticeManagementPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNotices = async () => {
    try {
      const data = await noticeApi.getNotices({ search, limit: 100 });
      setNotices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    setDeletingId(id);
    try {
      await noticeApi.deleteNotice(id);
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Notice Management
          </h1>
          <p className="text-xs text-muted font-mono mt-1">
            Manage, publish, edit, and audit campus intelligence notices
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/create"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-panel hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition"
          >
            <Plus className="w-4 h-4 text-primary" />
            <span>Create Notice</span>
          </Link>
          <Link
            to="/admin/upload"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-black text-xs font-bold transition shadow-glow-primary"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter notices by keyword or title..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Data Table */}
      <div className="rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 font-mono uppercase text-muted text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Title & Scope</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Importance</th>
                <th className="py-3.5 px-4">Urgency</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted font-mono">
                    Loading records...
                  </td>
                </tr>
              ) : notices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted font-mono">
                    No notices found.
                  </td>
                </tr>
              ) : (
                notices.map((n) => (
                  <tr key={n.id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-4 font-semibold text-white max-w-xs">
                      <Link to={`/notices/${n.id}`} className="hover:text-primary transition line-clamp-1">
                        {n.title}
                      </Link>
                      <span className="text-[10px] font-mono text-muted block mt-0.5">
                        {n.department || 'Academic Affairs'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <CategoryBadge category={n.category} />
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <LevelBadge level={n.importance_level} />
                        <span className="text-white font-bold">{n.importance}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold uppercase text-muted">
                      {n.urgency}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted">
                      {n.deadline || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/notices/${n.id}`}
                          className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition"
                          title="View Analysis"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(n.id)}
                          disabled={deletingId === n.id}
                          className="p-1.5 rounded-lg text-muted hover:text-critical hover:bg-white/5 transition"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
