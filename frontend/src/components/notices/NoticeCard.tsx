import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Notice } from '../../types';
import { ScoreGauge } from '../ui/ScoreGauge';
import { CategoryBadge, LevelBadge } from '../ui/Badge';
import { ExplainabilityModal } from './ExplainabilityModal';
import { Calendar, Clock, AlertTriangle, ArrowRight, HelpCircle, CheckSquare, Sparkles } from 'lucide-react';
import { taskApi } from '../../services/taskApi';

interface NoticeCardProps {
  notice: Notice;
  onTaskCreated?: () => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice, onTaskCreated }) => {
  const navigate = useNavigate();
  const [showExplain, setShowExplain] = useState(false);
  const [taskAdded, setTaskAdded] = useState(false);
  const [taskError, setTaskError] = useState('');

  const handleQuickTask = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!localStorage.getItem('nexa_token')) { navigate('/login'); return; }
    setTaskError('');
    try {
      const taskTitle = notice.actions && notice.actions.length > 0
        ? notice.actions[0]
        : `Review notice: ${notice.title}`;

      await taskApi.createTask({
        title: taskTitle,
        notice_id: notice.id,
        deadline: notice.deadline,
        priority: notice.importance_level,
        status: 'Pending',
      });
      setTaskAdded(true);
      if (onTaskCreated) onTaskCreated();
      setTimeout(() => setTaskAdded(false), 2500);
    } catch (err) {
      setTaskError('Could not save task. Please try again.');
    }
  };

  return (
    <>
      {taskError && <p role="alert" className="text-critical text-xs">{taskError}</p>}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.25 }}
        onClick={() => navigate(`/notices/${notice.id}`)}
        className="group relative rounded-2xl glass-panel p-5 sm:p-6 cursor-pointer border border-white/10 hover:border-primary/40 hover:shadow-glow-primary transition-all duration-300 flex flex-col justify-between"
      >
        {/* Top Header Row */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <LevelBadge level={notice.importance_level} />
              <CategoryBadge category={notice.category} />
              {notice.confidence && (
                <span className="text-[10px] font-mono font-medium text-muted flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5 text-primary" />
                  {Math.round(notice.confidence * 100)}% Conf.
                </span>
              )}
            </div>

            {/* Score Radial Gauge */}
            <div className="flex-shrink-0" onClick={(e) => { e.stopPropagation(); setShowExplain(true); }}>
              <ScoreGauge score={notice.importance} level={notice.importance_level} size="sm" showLabel={false} />
            </div>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {notice.title}
          </h3>

          {/* Factual Short Summary */}
          <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-4">
            {notice.summary}
          </p>
        </div>

        {/* Info Metadata Grid */}
        <div className="pt-3 border-t border-white/5 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs text-muted font-mono">
            {/* Event / Notice Date */}
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-info flex-shrink-0" />
              <span className="truncate">
                {notice.event_date ? `${notice.event_date}${notice.event_time ? ` · ${notice.event_time}` : ''}` : (notice.created_at ? notice.created_at.slice(0, 10) : 'Active')}
              </span>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-warning flex-shrink-0" />
              <span className={`truncate ${notice.deadline ? 'text-warning font-semibold' : 'text-muted'}`}>
                {notice.deadline ? `Due: ${notice.deadline}` : 'No deadline'}
              </span>
            </div>
          </div>

          {/* Actions & Urgency Footer */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted flex items-center gap-1">
                Urgency: <span className="font-semibold text-white">{notice.urgency}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowExplain(true); }}
                title="Explain AI score"
                className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/10 transition"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleQuickTask}
                title="Add to Tasks"
                className={`p-1.5 rounded-lg transition ${
                  taskAdded ? 'bg-primary/20 text-primary' : 'text-muted hover:text-white hover:bg-white/10'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover group-hover:translate-x-0.5 transition-transform"
              >
                View
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Explainable AI Modal */}
      <ExplainabilityModal
        isOpen={showExplain}
        onClose={() => setShowExplain(false)}
        notice={notice}
      />
    </>
  );
};
