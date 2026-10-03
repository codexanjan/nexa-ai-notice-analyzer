import React from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { ScoreGauge } from '../ui/ScoreGauge';
import { Notice } from '../../types';
import { Info, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

interface ExplainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice: Notice | null;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  isOpen,
  onClose,
  notice,
}) => {
  if (!notice) return null;

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

  const factorItems = [
    {
      label: 'Category Criticality',
      weight: '20%',
      score: factors.category_criticality || 0,
      description: `Domain importance of ${notice.category}`,
      color: 'bg-primary text-black',
    },
    {
      label: 'Deadline Proximity',
      weight: '25%',
      score: factors.deadline_proximity || 0,
      description: notice.deadline ? `Deadline: ${notice.deadline}` : 'No deadline detected',
      color: 'bg-critical text-white',
    },
    {
      label: 'Action Required',
      weight: '20%',
      score: factors.action_required || 0,
      description: notice.actions?.length ? `${notice.actions.length} action(s) detected` : 'Informational only',
      color: 'bg-warning text-black',
    },
    {
      label: 'Urgency Signals',
      weight: '15%',
      score: factors.urgency_signals || 0,
      description: 'Critical keywords and time directives',
      color: 'bg-info text-black',
    },
    {
      label: 'Consequence',
      weight: '10%',
      score: factors.consequence || 0,
      description: 'Explicit penalty or academic repercussions',
      color: 'bg-rose-400 text-black',
    },
    {
      label: 'Event Proximity',
      weight: '10%',
      score: factors.event_proximity || 0,
      description: notice.event_date ? `Event: ${notice.event_date}` : 'No event date',
      color: 'bg-emerald-400 text-black',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transparent AI Scoring Breakdown"
      subtitle={`Why was this notice evaluated as ${notice.importance_level}?`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Top Summary Banner */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-surface/80 border border-white/10">
          <ScoreGauge score={notice.importance} level={notice.importance_level} size="md" />
          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-display font-bold text-lg text-white">
              {notice.importance} / 100 — {notice.importance_level}
            </h4>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Calculated using NEXA's deterministic explainable formulation:
            </p>
            <div className="mt-2 text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-2.5 py-1.5 rounded-lg inline-block">
              I = 0.20C + 0.25D + 0.20A + 0.15U + 0.10K + 0.10E
            </div>
          </div>
        </div>

        {/* Explainable Factors Progress Bars */}
        <div>
          <h5 className="text-xs font-mono uppercase text-muted tracking-wider mb-3">
            Factor Breakdown & Weightage
          </h5>
          <div className="space-y-3.5">
            {factorItems.map((item, idx) => (
              <div key={item.label} className="p-3 rounded-xl bg-surface/40 border border-white/5">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{item.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-muted">
                      Weight: {item.weight}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    {Math.round(item.score)}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.08 }}
                    className={`h-full rounded-full ${item.color.split(' ')[0]}`}
                  />
                </div>
                <p className="text-[11px] text-muted mt-1.5 flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-muted/80" />
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Textual Justification */}
        {notice.explanation && notice.explanation.length > 0 && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <h5 className="text-xs font-mono uppercase text-primary tracking-wider mb-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              AI Natural Language Rationale
            </h5>
            <ul className="space-y-2 text-xs text-gray-300">
              {notice.explanation.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold tracking-wide transition"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </Modal>
  );
};
