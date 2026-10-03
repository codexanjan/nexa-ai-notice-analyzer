import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Cpu,
  FileSearch,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Layers,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Lock,
  Terminal
} from 'lucide-react';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { noticeApi } from '../services/noticeApi';
import { AIAnalysisResult } from '../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [demoText, setDemoText] = useState(
    "All students are hereby informed that the internal assessment examination for the current semester will be conducted on Monday at 10 AM in Main Auditorium. Students must carry their college ID cards and hall tickets. Entry closes 15 minutes before exam."
  );
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<AIAnalysisResult | null>(null);

  const handleRunDemo = async () => {
    setDemoLoading(true);
    try {
      const res = await noticeApi.analyzeNotice(demoText);
      setDemoResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="space-y-24">
      {/* HERO SECTION */}
      <section className="text-center pt-12 pb-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Logo Brand Emblem */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500"></div>
              <img
                src="/nexa-logo.jpg"
                alt="NEXA AI Logo"
                className="relative w-20 h-20 rounded-2xl border border-white/20 shadow-2xl object-cover"
              />
            </div>
          </div>

          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-semibold tracking-wider uppercase shadow-glow-primary">
            <Sparkles className="w-3.5 h-3.5" />
            AI Document Intelligence for Higher Education
          </div>

          {/* Master Heading */}
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-tight">
            Read Less. <span className="text-gradient-neon">Know More.</span>
          </h1>

          <p className="text-base sm:text-xl text-muted max-w-2xl mx-auto font-sans leading-relaxed">
            NEXA transforms unstructured college circulars, notices, and scanned documents into structured, explainable, and actionable intelligence in seconds.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-sm tracking-wide transition-all duration-300 shadow-glow-primary hover:scale-105"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl glass-panel hover:bg-white/10 text-white font-medium text-sm tracking-wide transition border border-white/15"
            >
              <span>Sign In</span>
            </Link>
          </div>

          {/* Platform Cinematic Preview Banner */}
          <div className="pt-6 max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl group">
              <img
                src="/nexa-hero.jpg"
                alt="NEXA AI Notice Intelligence Architecture"
                className="w-full h-auto object-cover rounded-2xl group-hover:scale-[1.01] transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent flex items-end p-4 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-primary/40 text-primary text-[11px] font-mono">
                    ⚡ Multimodal Document Extraction
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-accent/40 text-accent text-[11px] font-mono">
                    🎯 Explainable Urgency Scoring
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono">
                    📅 Automated Deadline Detection
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* INTERACTIVE DEMO TESTING SANDBOX */}
      <section className="max-w-5xl mx-auto rounded-3xl glass-panel border border-white/15 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider">
              <BrainCircuit className="w-4 h-4" />
              Live Interactive Sandbox
            </div>
            <h2 className="font-display font-bold text-2xl text-white mt-1">
              Test NEXA Intelligence Pipeline
            </h2>
          </div>
          <button
            onClick={handleRunDemo}
            disabled={demoLoading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-xs tracking-wide transition disabled:opacity-50 shadow-glow-primary"
          >
            {demoLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Run AI Intelligence Pipeline
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          {/* Input text */}
          <div className="space-y-3">
            <label className="text-xs font-mono text-muted uppercase">Unstructured College Notice Input</label>
            <textarea
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              rows={7}
              className="w-full p-4 rounded-xl bg-surface/90 border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-primary/50 transition font-sans resize-none"
              placeholder="Paste any college notice..."
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDemoText("Final date for examination registration is today at 5 PM. Students who fail to register will not be permitted to appear for the semester examination.")}
                className="text-[11px] font-mono text-muted hover:text-white underline"
              >
                Sample 2: Critical Registration Notice
              </button>
              <span className="text-muted">•</span>
              <button
                type="button"
                onClick={() => setDemoText("Campus recruitment drive by Google for Software Engineering roles is scheduled on Friday at 9:30 AM in Main Auditorium. Submit resumes by Thursday.")}
                className="text-[11px] font-mono text-muted hover:text-white underline"
              >
                Sample 3: Placement Drive
              </button>
            </div>
          </div>

          {/* Real-time output */}
          <div className="p-5 rounded-2xl bg-surface/60 border border-white/10 flex flex-col justify-between">
            {demoResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-mono text-muted uppercase">Category & Confidence</span>
                    <h4 className="font-display font-bold text-base text-primary">
                      {demoResult.category.value} ({Math.round(demoResult.category.confidence * 100)}%)
                    </h4>
                  </div>
                  <ScoreGauge score={demoResult.importance.score} level={demoResult.importance.level} size="sm" />
                </div>

                <div>
                  <span className="text-[10px] font-mono text-muted uppercase">Factual AI Summary</span>
                  <p className="text-xs text-gray-200 mt-1 leading-relaxed bg-white/5 p-2.5 rounded-lg border border-white/5">
                    {demoResult.summary}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-white/5 p-2 rounded-lg">
                    <span className="text-[10px] text-muted block">Date / Time</span>
                    <span className="text-white truncate block">{demoResult.entities.date || 'Not stated'}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <span className="text-[10px] text-muted block">Urgency Level</span>
                    <span className="text-warning truncate block">{demoResult.urgency.level}</span>
                  </div>
                </div>

                {demoResult.actions && demoResult.actions.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono text-muted uppercase">Required Actions</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {demoResult.actions.map((act, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary">
                          ✓ {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <BrainCircuit className="w-10 h-10 text-muted/50" />
                <p className="text-xs text-muted font-mono">Click "Run AI Intelligence Pipeline" above to see real-time classification, extraction, scoring, and factual summarization.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-display font-bold text-3xl text-white">
            Engineered For Document Intelligence
          </h2>
          <p className="text-xs text-muted">
            Replacing manual parsing with deterministic, mathematically explainable AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-white/10 hover:border-primary/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Full-Spectrum OCR & Extraction</h3>
            <p className="text-xs text-muted leading-relaxed">
              Native extraction using PyMuPDF for digital PDFs and OCR pipeline for scanned circulars, images, Word DOCX, and plain text.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-white/10 hover:border-primary/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-critical/10 border border-critical/30 flex items-center justify-center text-critical">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Deterministic Explainability</h3>
            <p className="text-xs text-muted leading-relaxed">
              Transparent multi-factor importance scoring based on Category Criticality, Deadline Proximity, Mandatory Actions, and Consequences.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-white/10 hover:border-primary/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/30 flex items-center justify-center text-warning">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Action & Task Generation</h3>
            <p className="text-xs text-muted leading-relaxed">
              Automatically discovers student tasks, calculates dynamic deadline urgency, and dispatches in-app alerts.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="text-center py-12 space-y-6">
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white">
          Ready to experience modern notice intelligence?
        </h2>
        <div className="flex justify-center gap-4">
          <Link
            to="/dashboard"
            className="px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-sm tracking-wide transition shadow-glow-primary"
          >
            Launch Platform Demo
          </Link>
        </div>
      </section>
    </div>
  );
};
