import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticeApi } from '../../services/noticeApi';
import { ProcessingStepper, PIPELINE_STEPS } from '../../components/ui/ProcessingStepper';
import { ScoreGauge } from '../../components/ui/ScoreGauge';
import { CategoryBadge, LevelBadge } from '../../components/ui/Badge';
import { AIAnalysisResult } from '../../types';
import {
  UploadCloud,
  FileText,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const UploadNoticePage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'FILE' | 'PASTE'>('FILE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      if (!noticeTitle) {
        setNoticeTitle(e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!noticeTitle) {
        setNoticeTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const runPipeline = async () => {
    setError(null);
    setIsProcessing(true);
    setCurrentStep(0);
    setAnalysisResult(null);

    // Animate through first few steps while upload / extraction runs
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 6) return prev + 1;
        return prev;
      });
    }, 350);

    try {
      let resultData: AIAnalysisResult;
      let textContent = '';

      if (activeTab === 'FILE') {
        if (!selectedFile) {
          throw new Error("Please select a file to upload.");
        }
        const res = await noticeApi.uploadNoticeFile(selectedFile);
        resultData = res.analysis;
        textContent = res.extracted_text;
      } else {
        if (!pastedText.trim()) {
          throw new Error("Please paste notice text to analyze.");
        }
        const res = await noticeApi.analyzeNotice(pastedText);
        resultData = res;
        textContent = pastedText;
      }

      clearInterval(stepTimer);
      setCurrentStep(7);
      await new Promise((r) => setTimeout(r, 400));
      setCurrentStep(8); // Complete
      await new Promise((r) => setTimeout(r, 400));

      setExtractedText(textContent);
      setAnalysisResult(resultData);
      if (!noticeTitle) {
        setNoticeTitle(resultData.summary.slice(0, 50) + "...");
      }
    } catch (err: any) {
      clearInterval(stepTimer);
      setError(err.response?.data?.detail || err.message || "Failed to process notice");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublish = async () => {
    if (!analysisResult) return;
    setPublishing(true);
    try {
      const created = await noticeApi.createNotice({
        title: noticeTitle || analysisResult.category.value + " Announcement",
        content: extractedText,
        category: analysisResult.category.value,
        deadline: analysisResult.entities.deadline,
        event_date: analysisResult.entities.date,
        event_time: analysisResult.entities.time,
        location: analysisResult.entities.location,
        department: analysisResult.entities.department,
        status: 'PUBLISHED',
      });
      navigate(`/notices/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to publish notice");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-white/10">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          Upload & Intelligence Ingestion
        </h1>
        <p className="text-xs text-muted font-mono mt-1">
          Supports PDF (PyMuPDF), Scanned Images (OCR), DOCX, TXT, and Text Paste
        </p>
      </div>

      {/* Tabs: Upload File vs Paste Text */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs">
        <button
          onClick={() => { setActiveTab('FILE'); setError(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
            activeTab === 'FILE'
              ? 'bg-primary/15 text-primary border border-primary/30 font-semibold'
              : 'text-muted hover:text-white'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload File (PDF / Images / DOCX / TXT)</span>
        </button>

        <button
          onClick={() => { setActiveTab('PASTE'); setError(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
            activeTab === 'PASTE'
              ? 'bg-primary/15 text-primary border border-primary/30 font-semibold'
              : 'text-muted hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Direct Text Paste</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-critical/15 border border-critical/30 text-critical text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* INGESTION INPUT CARD */}
      {!analysisResult && !isProcessing && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
          {activeTab === 'FILE' ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-white/20 hover:border-primary/50 rounded-3xl p-10 text-center space-y-4 cursor-pointer transition-all duration-300 bg-surface/40 hover:bg-surface/70"
            >
              <input
                type="file"
                id="file-upload"
                onChange={handleFileSelect}
                accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.txt"
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer block space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center mx-auto shadow-glow-primary">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    {selectedFile ? selectedFile.name : 'Drag & drop notice file here, or browse'}
                  </h3>
                  <p className="text-xs text-muted mt-1 font-mono">
                    Supported: PDF, PNG, JPG, JPEG, DOCX, TXT (Max 25MB)
                  </p>
                </div>
              </label>

              {selectedFile && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-primary">
                  <FileCheck className="w-4 h-4" />
                  Ready to process: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-mono text-muted uppercase block">
                Paste Circular / Notice Content
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={9}
                placeholder="Paste notice body here..."
                className="w-full p-4 rounded-2xl bg-surface border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-primary/50 font-mono resize-none"
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={runPipeline}
              disabled={activeTab === 'FILE' ? !selectedFile : !pastedText.trim()}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-xs tracking-wider uppercase transition shadow-glow-primary disabled:opacity-40 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze with NEXA Pipeline</span>
            </button>
          </div>
        </div>
      )}

      {/* LIVE PROCESSING STEPPER (Section 13) */}
      {isProcessing && (
        <div className="py-8">
          <ProcessingStepper currentStep={currentStep} />
        </div>
      )}

      {/* ANALYSIS RESULT PREVIEW & PUBLISH BAR */}
      {analysisResult && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-primary/30 shadow-glow-primary space-y-6 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-lg text-white">AI Analysis Completed</h2>
            </div>
            <button
              onClick={() => { setAnalysisResult(null); setSelectedFile(null); setPastedText(''); }}
              className="text-xs text-muted hover:text-white font-mono flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Analyze Another Document
            </button>
          </div>

          <div>
            <label className="text-xs font-mono text-muted block mb-1.5">Notice Title</label>
            <input
              type="text"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-sm font-semibold focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-2xl bg-surface/70 border border-white/10 items-center">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-muted uppercase">Classification</span>
              <div className="flex items-center gap-2">
                <CategoryBadge category={analysisResult.category.value} />
                <span className="text-xs font-mono text-primary font-bold">
                  {Math.round(analysisResult.category.confidence * 100)}% Conf.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <ScoreGauge score={analysisResult.importance.score} level={analysisResult.importance.level} size="md" />
            </div>

            <div className="space-y-2 text-right">
              <span className="text-[10px] font-mono text-muted uppercase">Urgency Rating</span>
              <div>
                <LevelBadge level={analysisResult.urgency.level} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono text-primary uppercase font-semibold">AI Generated Summary</span>
            <p className="text-xs text-gray-200 bg-white/5 p-3.5 rounded-xl border border-white/5 leading-relaxed font-sans">
              "{analysisResult.summary}"
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-surface border border-white/5">
              <span className="text-[10px] text-muted block">Date</span>
              <span className="text-white font-semibold truncate block">
                {analysisResult.entities.date || 'Not stated'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-white/5">
              <span className="text-[10px] text-muted block">Time</span>
              <span className="text-white font-semibold truncate block">
                {analysisResult.entities.time || 'Not stated'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-white/5">
              <span className="text-[10px] text-muted block">Deadline</span>
              <span className="text-warning font-semibold truncate block">
                {analysisResult.entities.deadline || 'No deadline'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-white/5">
              <span className="text-[10px] text-muted block">Location</span>
              <span className="text-white font-semibold truncate block">
                {analysisResult.entities.location || 'Not stated'}
              </span>
            </div>
          </div>

          {analysisResult.actions && analysisResult.actions.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-muted uppercase">Extracted Actions</span>
              <div className="flex flex-wrap gap-2">
                {analysisResult.actions.map((act, i) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-lg bg-primary/10 border border-primary/30 text-primary">
                    ✓ {act}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-white/10 gap-3">
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-xs tracking-wider uppercase transition shadow-glow-primary flex items-center gap-2"
            >
              {publishing ? (
                <span>Publishing to Campus Feed...</span>
              ) : (
                <>
                  <span>Publish Notice & Alert Students</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
