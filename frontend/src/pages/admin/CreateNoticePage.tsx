import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { noticeApi } from '../../services/noticeApi';
import { ScoreGauge } from '../../components/ui/ScoreGauge';
import { CategoryBadge, LevelBadge } from '../../components/ui/Badge';
import { AIAnalysisResult, Notice } from '../../types';
import {
  FilePlus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  Eye
} from 'lucide-react';

export const CreateNoticePage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get('edit');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [location, setLocation] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [previewAnalysis, setPreviewAnalysis] = useState<AIAnalysisResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!editId) return;
    noticeApi.getNoticeById(editId).then(doc => {
      setTitle(doc.title); setContent(doc.content); setCategory(doc.category);
      setDepartment(doc.department || ''); setDeadline(doc.deadline || '');
      setEventDate(doc.event_date || ''); setLocation(doc.location || '');
    }).catch(() => setError('Could not load this notice for editing.'));
  }, [editId]);

  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError("Please enter notice content to analyze.");
      return;
    }
    setError(null);
    setAnalyzing(true);
    try {
      const res = await noticeApi.analyzeNotice(content, category || undefined);
      setPreviewAnalysis(res);
      if (!category) setCategory(res.category.value);
      if (!deadline && res.entities.deadline) setDeadline(res.entities.deadline);
      if (!eventDate && res.entities.date) setEventDate(res.entities.date);
      if (!location && res.entities.location) setLocation(res.entities.location);
      if (!department && res.entities.department) setDepartment(res.entities.department);
    } catch (err: any) {
      setError(err.response?.data?.detail || "AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async (status: 'PUBLISHED' | 'DRAFT') => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const save = editId ? (data: Parameters<typeof noticeApi.createNotice>[0]) => noticeApi.updateNotice(editId, {...data, category: data.category as Notice['category'], status: data.status as Notice['status']}) : noticeApi.createNotice;
      const doc = await save({
        title,
        content,
        category: category || undefined,
        department: department || undefined,
        deadline: deadline || undefined,
        event_date: eventDate || undefined,
        location: location || undefined,
        status,
      });
      navigate(`/notices/${doc.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create notice");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-2 border-b border-white/10">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          {editId ? 'Edit Campus Notice' : 'Create & Analyze Campus Notice'}
        </h1>
        <p className="text-xs text-muted font-mono mt-1">
          Draft official circulars with immediate AI importance & urgency scoring
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-critical/15 border border-critical/30 text-critical text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
        <div>
          <label className="text-xs font-mono text-muted block mb-1.5">Notice Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Schedule for Mid-Term Examination 2026"
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono text-muted">Notice Content / Directives *</label>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing || !content.trim()}
              className="text-xs font-mono text-primary hover:underline flex items-center gap-1 disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {analyzing ? 'Analyzing with AI...' : 'Analyze with NEXA AI'}
            </button>
          </div>
          <textarea
            required
            rows={7}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter the complete text of the college notice..."
            className="w-full p-4 rounded-xl bg-surface border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-primary/50 font-sans resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-mono text-muted block mb-1.5">Category (Optional)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50"
            >
              <option value="">Auto-Detect via ML</option>
              <option value="EXAMINATION">Examination</option>
              <option value="ASSIGNMENT">Assignment</option>
              <option value="ATTENDANCE">Attendance</option>
              <option value="FEES">Fees</option>
              <option value="PLACEMENT">Placement</option>
              <option value="SCHOLARSHIP">Scholarship</option>
              <option value="EVENT">Event</option>
              <option value="HOLIDAY">Holiday</option>
              <option value="ACADEMIC">Academic</option>
              <option value="ADMINISTRATION">Administration</option>
              <option value="ADMISSION">Admission</option>
              <option value="WORKSHOP">Workshop</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="RESULT">Result</option>
              <option value="REGISTRATION">Registration</option>
              <option value="HOSTEL">Hostel</option>
              <option value="TRANSPORT">Transport</option>
              <option value="EMERGENCY">Emergency</option>
              <option value="GENERAL">General</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-mono text-muted block mb-1.5">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Examination Cell"
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-muted block mb-1.5">Submission Deadline</label>
            <input
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="e.g. Friday at 5 PM"
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-muted block mb-1.5">Event Date / Schedule</label>
            <input
              type="text"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              placeholder="e.g. Monday, 10 October 2026"
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-muted block mb-1.5">Location / Venue</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Main Auditorium"
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        {/* Real-time AI Analysis Preview before publishing (Section 20) */}
        {previewAnalysis && (
          <div className="p-5 rounded-2xl bg-surface/70 border border-primary/30 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs font-mono text-primary uppercase font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Live AI Analysis Verification
              </span>
              <div className="flex items-center gap-2">
                <CategoryBadge category={previewAnalysis.category.value} />
                <LevelBadge level={previewAnalysis.importance.level} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ScoreGauge score={previewAnalysis.importance.score} level={previewAnalysis.importance.level} size="sm" />
              <div className="flex-1 space-y-1">
                <span className="text-[11px] font-mono text-muted block">AI Generated Executive Summary:</span>
                <p className="text-xs text-gray-200">{previewAnalysis.summary}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing || !content.trim()}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition flex items-center gap-1.5 border border-white/10"
          >
            <Eye className="w-4 h-4" />
            <span>Analyze Preview</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('DRAFT')}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl bg-surface hover:bg-white/5 text-xs font-semibold text-gray-300 transition border border-white/10"
          >
            <Save className="w-4 h-4 inline mr-1" />
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave('PUBLISHED')}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-xs uppercase tracking-wider transition shadow-glow-primary flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Publish Notice
          </button>
        </div>
      </div>
    </div>
  );
};
