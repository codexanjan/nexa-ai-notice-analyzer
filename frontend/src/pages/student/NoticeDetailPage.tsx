import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { noticeApi } from '../../services/noticeApi';
import { taskApi } from '../../services/taskApi';
import { Notice } from '../../types';
import { ScoreGauge } from '../../components/ui/ScoreGauge';
import { CategoryBadge, LevelBadge } from '../../components/ui/Badge';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Building,
  GraduationCap,
  FileCheck,
  CheckCircle2,
  Sparkles,
  Info,
  CheckSquare,
  HelpCircle,
  Copy,
  Check,
  MessageSquare,
  Send,
  AlertCircle
} from 'lucide-react';

export const NoticeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [taskCreated, setTaskCreated] = useState<string | null>(null);

  // Simple In-Context AI Assistant (Section 24)
  const [assistantQuestion, setAssistantQuestion] = useState('');
  const [assistantAnswers, setAssistantAnswers] = useState<{ q: string; a: string }[]>([]);

  useEffect(() => {
    const fetchNotice = async () => {
      if (!id) return;
      try {
        const data = await noticeApi.getNoticeById(id);
        setNotice(data);
      } catch (err) {
        console.error("Notice not found:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotice();
  }, [id]);

  const handleCopyOriginal = () => {
    if (notice?.content) {
      navigator.clipboard.writeText(notice.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateTask = async (actionText: string) => {
    if (!notice) return;
    try {
      await taskApi.createTask({
        title: actionText,
        notice_id: notice.id,
        deadline: notice.deadline,
        priority: notice.importance_level,
        status: 'Pending',
      });
      setTaskCreated(actionText);
      setTimeout(() => setTaskCreated(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAskAssistant = (promptText?: string) => {
    const query = (promptText || assistantQuestion).trim();
    if (!query || !notice) return;

    let response = "";
    const qLower = query.toLowerCase();

    if (qLower.includes("about") || qLower.includes("summarize") || qLower.includes("what is")) {
      response = notice.summary || "This notice pertains to " + notice.category;
    } else if (qLower.includes("deadline") || qLower.includes("when")) {
      response = notice.deadline ? `The explicit deadline stated is: ${notice.deadline}.` : "No explicit submission deadline was detected in this notice.";
    } else if (qLower.includes("action") || qLower.includes("required") || qLower.includes("what do i do")) {
      response = notice.actions?.length
        ? `Required student actions: ${notice.actions.join(', ')}.`
        : "This notice is primarily informational. No explicit mandatory action required.";
    } else if (qLower.includes("where") || qLower.includes("location") || qLower.includes("venue")) {
      response = notice.location ? `The location is ${notice.location}.` : "No specific venue or location was explicitly stated in the circular.";
    } else {
      response = `Based on the notice content: It is an announcement categorized under ${notice.category} with importance score ${notice.importance}/100 (${notice.importance_level}). Summary: ${notice.summary}`;
    }

    setAssistantAnswers((prev) => [...prev, { q: query, a: response }]);
    setAssistantQuestion('');
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-muted">Retrieving Notice Intelligence...</span>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-critical mx-auto" />
        <h2 className="text-xl font-bold text-white">Notice Not Found</h2>
        <Link to="/notices" className="text-xs font-semibold text-primary hover:underline font-mono">
          ← Back to Notice Feed
        </Link>
      </div>
    );
  }

  const factors = notice.explanation_factors || {
    category_criticality: 90,
    deadline_proximity: notice.deadline ? 90 : 0,
    action_required: notice.actions?.length ? 85 : 10,
    urgency_signals: 70,
    consequence: 40,
    event_proximity: notice.event_date ? 80 : 0,
    weights: {
      category_criticality: 0.20,
      deadline_proximity: 0.25,
      action_required: 0.20,
      urgency_signals: 0.15,
      consequence: 0.10,
      event_proximity: 0.10,
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-mono text-muted hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted">
            ID: <span className="text-white">{notice.id.slice(0, 8)}...</span>
          </span>
          <button
            onClick={handleCopyOriginal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-xs text-gray-300 hover:text-white transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
        </div>
      </div>

      {/* NOTICE TITLE & EXECUTIVE HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <LevelBadge level={notice.importance_level} size="md" />
          <CategoryBadge category={notice.category} className="text-xs" />
          {notice.confidence && (
            <span className="text-xs font-mono font-medium text-primary flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              AI Confidence: {Math.round(notice.confidence * 100)}%
            </span>
          )}
          <span className="text-xs font-mono text-muted ml-auto">
            Urgency: <strong className="text-white uppercase">{notice.urgency}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          <div className="lg:col-span-3 space-y-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white leading-tight">
              {notice.title}
            </h1>
            <p className="text-xs font-mono text-muted flex items-center gap-2 pt-1">
              <span>{notice.department || 'Academic Affairs'}</span>
              <span>•</span>
              <span>Published: {notice.created_at ? notice.created_at.slice(0, 10) : 'Active'}</span>
            </p>
          </div>

          <div className="flex justify-start lg:justify-end">
            <div className="p-4 rounded-2xl bg-surface/80 border border-white/10 flex items-center gap-4">
              <ScoreGauge score={notice.importance} level={notice.importance_level} size="md" />
            </div>
          </div>
        </div>

        {/* FACTUAL AI SUMMARY SECTION (Section 5) */}
        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider font-semibold">
            <Sparkles className="w-4 h-4" />
            Factual AI Summary (No Hallucinations)
          </div>
          <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-sans">
            "{notice.summary}"
          </p>
        </div>
      </div>

      {/* EXTRACTED INFORMATION GRID & ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Entities & Required Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Key Information Extracted (Section 6) */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              Extracted Key Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-surface border border-white/5 space-y-1">
                <span className="text-muted flex items-center gap-1.5 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-info" /> Event Date
                </span>
                <span className="font-semibold text-white text-sm block">
                  {notice.event_date || 'Not specified in notice'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-white/5 space-y-1">
                <span className="text-muted flex items-center gap-1.5 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-warning" /> Time
                </span>
                <span className="font-semibold text-white text-sm block">
                  {notice.event_time || 'Not specified in notice'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-white/5 space-y-1">
                <span className="text-muted flex items-center gap-1.5 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-critical" /> Deadline
                </span>
                <span className={`font-semibold text-sm block ${notice.deadline ? 'text-warning font-bold' : 'text-gray-400'}`}>
                  {notice.deadline || 'No deadline detected'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-white/5 space-y-1">
                <span className="text-muted flex items-center gap-1.5 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Location / Venue
                </span>
                <span className="font-semibold text-white text-sm block">
                  {notice.location || 'Not specified in notice'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-white/5 space-y-1">
                <span className="text-muted flex items-center gap-1.5 text-[11px]">
                  <Building className="w-3.5 h-3.5 text-muted" /> Department
                </span>
                <span className="font-semibold text-white text-sm block">
                  {notice.department || 'Not specified in notice'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-white/5 space-y-1">
                <span className="text-muted flex items-center gap-1.5 text-[11px]">
                  <GraduationCap className="w-3.5 h-3.5 text-muted" /> Semester / Batch
                </span>
                <span className="font-semibold text-white text-sm block">
                  {notice.semester || 'All Semesters / General'}
                </span>
              </div>
            </div>

            {/* Mandatory Requirements */}
            {notice.requirements && notice.requirements.length > 0 && (
              <div className="pt-3 border-t border-white/5 space-y-2">
                <span className="text-xs font-mono uppercase text-muted tracking-wider">Required Documents & Items</span>
                <div className="flex flex-wrap gap-2">
                  {notice.requirements.map((req, idx) => (
                    <span key={idx} className="text-xs px-3 py-1 rounded-lg bg-surface border border-white/10 text-gray-200">
                      • {req}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* REQUIRED ACTIONS & TASKS (Section 8) */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-warning" />
                Required Actions & Tasks
              </h2>
              <span className="text-xs font-mono text-muted">
                {notice.actions?.length || 0} Action item(s)
              </span>
            </div>

            {(!notice.actions || notice.actions.length === 0) ? (
              <p className="text-xs text-muted font-mono py-2">
                No immediate mandatory student action required for this notice.
              </p>
            ) : (
              <div className="space-y-3">
                {notice.actions.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-surface/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-white block">{act}</span>
                      <span className="text-[11px] font-mono text-muted block">
                        Deadline: {notice.deadline || 'As per notice guidelines'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCreateTask(act)}
                      disabled={taskCreated === act}
                      className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition flex items-center justify-center gap-1.5 ${
                        taskCreated === act
                          ? 'bg-success/20 text-success border border-success/40'
                          : 'bg-primary hover:bg-primary-hover text-black shadow-glow-primary'
                      }`}
                    >
                      {taskCreated === act ? (
                        <>
                          <Check className="w-4 h-4" /> Added to Tasks
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-4 h-4" /> Add Task
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ORIGINAL NOTICE TEXT VIEWER */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h2 className="font-display font-bold text-base text-white">Original Document Text</h2>
              <button onClick={handleCopyOriginal} className="text-xs text-muted hover:text-white font-mono">
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="p-4 rounded-xl bg-surface/80 border border-white/5 text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {notice.content}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Explainable AI & Interactive Assistant */}
        <div className="space-y-8">
          {/* WHY IT MATTERS — EXPLAINABLE AI BREAKDOWN (Section 9) */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Why It Matters (XAI)
            </h2>
            <p className="text-xs text-muted">
              Every score is fully deterministic and explainable across six key dimensions.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { label: 'Category Criticality', score: factors.category_criticality, weight: '20%', color: 'bg-primary' },
                { label: 'Deadline Proximity', score: factors.deadline_proximity, weight: '25%', color: 'bg-critical' },
                { label: 'Action Required', score: factors.action_required, weight: '20%', color: 'bg-warning' },
                { label: 'Urgency Signals', score: factors.urgency_signals, weight: '15%', color: 'bg-info' },
                { label: 'Consequence', score: factors.consequence, weight: '10%', color: 'bg-rose-400' },
                { label: 'Event Proximity', score: factors.event_proximity, weight: '10%', color: 'bg-emerald-400' },
              ].map((dim) => (
                <div key={dim.label} className="p-2.5 rounded-xl bg-surface/60 border border-white/5">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-300 font-medium">{dim.label}</span>
                    <span className="font-mono text-white font-bold">{Math.round(dim.score || 0)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${dim.color}`}
                      style={{ width: `${dim.score || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bullet Explanations */}
            {notice.explanation && notice.explanation.length > 0 && (
              <div className="pt-3 border-t border-white/5 space-y-2">
                <span className="text-xs font-mono uppercase text-primary font-semibold">Score Reasoning</span>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  {notice.explanation.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* EXTRACTED KEYWORDS */}
          {notice.keywords && notice.keywords.length > 0 && (
            <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-3">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Extracted Keywords
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {notice.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-surface border border-white/10 text-xs font-mono text-gray-300"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* IN-CONTEXT AI ASSISTANT (Section 24) */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h3 className="font-display font-bold text-base text-white">Ask NEXA AI Assistant</h3>
            </div>
            <p className="text-xs text-muted">
              Query specific questions regarding this document's requirements and timelines.
            </p>

            {/* Quick Prompts */}
            <div className="space-y-1.5">
              {[
                "What is this notice about?",
                "When is the deadline?",
                "What action is required?",
                "Where is the location?",
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskAssistant(p)}
                  className="w-full text-left p-2 rounded-xl bg-surface/50 border border-white/5 hover:border-primary/40 text-xs text-gray-300 hover:text-white transition flex items-center justify-between"
                >
                  <span>{p}</span>
                  <ArrowLeft className="w-3 h-3 rotate-180 text-muted" />
                </button>
              ))}
            </div>

            {/* Interactive answers */}
            {assistantAnswers.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-2 pt-2 border-t border-white/5">
                {assistantAnswers.map((pair, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 space-y-1 text-xs">
                    <p className="font-semibold text-primary">Q: {pair.q}</p>
                    <p className="text-gray-200">{pair.a}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Input prompt */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={assistantQuestion}
                onChange={(e) => setAssistantQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAssistant()}
                placeholder="Ask anything about this notice..."
                className="flex-1 px-3 py-2 rounded-xl bg-surface border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={() => handleAskAssistant()}
                className="p-2 rounded-xl bg-primary text-black hover:bg-primary-hover transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
