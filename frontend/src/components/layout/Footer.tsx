import React from 'react';
import { Sparkles, Shield, Cpu, Terminal, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-surface/50 backdrop-blur-md mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/nexa-logo.svg"
                alt="NEXA AI Logo"
                className="w-8 h-8 rounded-lg shadow-glow-primary"
              />
              <span className="font-display font-bold text-lg text-white">NEXA AI</span>
            </div>
            <p className="text-xs text-muted max-w-sm leading-relaxed">
              AI-Powered College Notice Intelligence System. Automatically converts unstructured campus circulars into structured, prioritized, explainable and actionable student intelligence.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[11px] font-mono text-primary">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> PyMuPDF & OCR
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" /> TF-IDF + Classifier
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Explainable AI
              </span>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li><Link to="/dashboard" className="hover:text-primary transition">Student Dashboard</Link></li>
              <li><Link to="/notices" className="hover:text-primary transition">Notice Feed</Link></li>
              <li><Link to="/deadlines" className="hover:text-primary transition">Deadline Center</Link></li>
              <li><Link to="/tasks" className="hover:text-primary transition">Action Taskboard</Link></li>
              <li><Link to="/admin" className="hover:text-primary transition">Admin Panel</Link></li>
            </ul>
          </div>

          {/* Intelligence Capabilities */}
          <div>
            <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider mb-3">
              Intelligence Engine
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>Document OCR & Text Extraction</li>
              <li>Automated Categorization</li>
              <li>Explainable Urgency Scoring</li>
              <li>Action & Deadline Extraction</li>
              <li>Real-Time In-App Alerts</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p>© 2026 NEXA — AI Notice Intelligence System. Read Less. Know More.</p>
            <span className="hidden sm:inline text-white/20">•</span>
            <p className="flex items-center gap-1.5">
              Made with <span className="text-red-500 animate-pulse">❤️</span> by{' '}
              <a
                href="https://github.com/codexanjan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary font-semibold underline underline-offset-4 decoration-primary/50 transition"
              >
                Anjan shetty
              </a>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Intelligence Engine Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};