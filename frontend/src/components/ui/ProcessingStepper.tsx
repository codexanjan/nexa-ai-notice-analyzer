import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export const PIPELINE_STEPS = [
  "Uploading",
  "Extracting Text",
  "OCR Processing",
  "Analyzing Content",
  "Classifying Notice",
  "Extracting Dates",
  "Calculating Importance",
  "Generating Summary",
  "Complete"
];

interface ProcessingStepperProps {
  currentStep?: number;
  isComplete?: boolean;
  onFinish?: () => void;
}

export const ProcessingStepper: React.FC<ProcessingStepperProps> = ({
  currentStep: externalStep,
  isComplete = false,
  onFinish,
}) => {
  const [internalStep, setInternalStep] = useState(0);

  // If no external step passed, auto-progress gracefully for realistic demo experience
  useEffect(() => {
    if (externalStep !== undefined) {
      setInternalStep(externalStep);
      return;
    }

    const interval = setInterval(() => {
      setInternalStep((prev) => {
        if (prev < PIPELINE_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          if (onFinish) onFinish();
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [externalStep, onFinish]);

  const activeIndex = externalStep !== undefined ? externalStep : internalStep;

  return (
    <div className="w-full max-w-xl mx-auto p-6 rounded-2xl glass-panel border border-white/10 shadow-2xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-glow-primary">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">NEXA AI Intelligence Pipeline</h3>
            <p className="text-xs text-muted">Real-time NLP, OCR & Machine Learning Execution</p>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-primary">
          Step {Math.min(activeIndex + 1, PIPELINE_STEPS.length)} of {PIPELINE_STEPS.length}
        </span>
      </div>

      <div className="space-y-3">
        {PIPELINE_STEPS.map((step, idx) => {
          const isDone = idx < activeIndex || isComplete;
          const isCurrent = idx === activeIndex && !isComplete;
          const isPending = idx > activeIndex && !isComplete;

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                isCurrent
                  ? 'bg-primary/10 border border-primary/40 shadow-glow-primary'
                  : isDone
                  ? 'bg-surface/50 border border-white/5'
                  : 'opacity-40 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-medium border border-white/10">
                  {idx + 1}
                </span>
                <span className={`text-sm font-medium ${isCurrent ? 'text-primary font-semibold' : isDone ? 'text-white' : 'text-muted'}`}>
                  {step}
                </span>
              </div>

              <div>
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </motion.div>
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <span className="text-xs text-muted/60 font-mono">Pending</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
