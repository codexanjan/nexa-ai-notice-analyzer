import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { NoticeCategory, ImportanceLevel, UrgencyLevel } from '../../types';

interface NoticeFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  importance: string;
  onImportanceChange: (val: string) => void;
  urgency: string;
  onUrgencyChange: (val: string) => void;
  onReset: () => void;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All Categories', value: 'ALL' },
  { label: 'Examination', value: 'EXAMINATION' },
  { label: 'Assignment', value: 'ASSIGNMENT' },
  { label: 'Attendance', value: 'ATTENDANCE' },
  { label: 'Fees', value: 'FEES' },
  { label: 'Placement', value: 'PLACEMENT' },
  { label: 'Scholarship', value: 'SCHOLARSHIP' },
  { label: 'Event', value: 'EVENT' },
  { label: 'Holiday', value: 'HOLIDAY' },
  { label: 'Academic', value: 'ACADEMIC' },
  { label: 'Administration', value: 'ADMINISTRATION' },
  { label: 'Admission', value: 'ADMISSION' },
  { label: 'Workshop', value: 'WORKSHOP' },
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Result', value: 'RESULT' },
  { label: 'Registration', value: 'REGISTRATION' },
  { label: 'Hostel', value: 'HOSTEL' },
  { label: 'Transport', value: 'TRANSPORT' },
  { label: 'Emergency', value: 'EMERGENCY' },
  { label: 'General', value: 'GENERAL' },
];

const IMPORTANCE_LEVELS = [
  { label: 'All Importance', value: 'ALL' },
  { label: 'Critical (81–100)', value: 'CRITICAL' },
  { label: 'High (61–80)', value: 'HIGH' },
  { label: 'Medium (31–60)', value: 'MEDIUM' },
  { label: 'Low (0–30)', value: 'LOW' },
];

const URGENCY_LEVELS = [
  { label: 'All Urgency', value: 'ALL' },
  { label: 'Critical', value: 'CRITICAL' },
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
];

export const NoticeFilters: React.FC<NoticeFiltersProps> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  importance,
  onImportanceChange,
  urgency,
  onUrgencyChange,
  onReset,
}) => {
  const hasActiveFilters = search || category !== 'ALL' || importance !== 'ALL' || urgency !== 'ALL';

  return (
    <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-4 mb-6">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notices by title, content, keywords (e.g., exam, placement, deadline, fee)..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface/80 border border-white/10 text-white placeholder-muted/70 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Select Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-muted mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Category Dropdown */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Importance Dropdown */}
        <select
          value={importance}
          onChange={(e) => onImportanceChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50"
        >
          {IMPORTANCE_LEVELS.map((lvl) => (
            <option key={lvl.value} value={lvl.value}>
              {lvl.label}
            </option>
          ))}
        </select>

        {/* Urgency Dropdown */}
        <select
          value={urgency}
          onChange={(e) => onUrgencyChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50"
        >
          {URGENCY_LEVELS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-muted hover:text-white transition flex items-center gap-1.5 ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
