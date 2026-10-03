export type UserRole = 'STUDENT' | 'ADMIN' | 'FACULTY';

export interface User {
  id: string;
  name: string;
  email: string;
  student_id?: string;
  role: UserRole;
  created_at?: string;
}

export type NoticeCategory =
  | 'EXAMINATION'
  | 'ASSIGNMENT'
  | 'ATTENDANCE'
  | 'FEES'
  | 'PLACEMENT'
  | 'SCHOLARSHIP'
  | 'EVENT'
  | 'HOLIDAY'
  | 'ACADEMIC'
  | 'ADMINISTRATION'
  | 'ADMISSION'
  | 'WORKSHOP'
  | 'INTERNSHIP'
  | 'RESULT'
  | 'REGISTRATION'
  | 'HOSTEL'
  | 'TRANSPORT'
  | 'EMERGENCY'
  | 'GENERAL';

export type ImportanceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ExplanationFactors {
  category_criticality: number;
  deadline_proximity: number;
  action_required: number;
  urgency_signals: number;
  consequence: number;
  event_proximity: number;
  weights: Record<string, number>;
}

export interface NoticeEntities {
  date?: string;
  time?: string;
  deadline?: string;
  location?: string;
  department?: string;
  semester?: string;
  requirements: string[];
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  confidence: number;
  importance: number;
  importance_level: ImportanceLevel;
  urgency: UrgencyLevel;
  summary: string;
  deadline?: string;
  event_date?: string;
  event_time?: string;
  location?: string;
  department?: string;
  semester?: string;
  requirements: string[];
  actions: string[];
  keywords: string[];
  explanation: string[];
  explanation_factors?: ExplanationFactors;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  attachment_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface AIAnalysisResult {
  category: {
    value: NoticeCategory;
    confidence: number;
  };
  importance: {
    score: number;
    level: ImportanceLevel;
  };
  urgency: {
    level: UrgencyLevel;
    score: number;
    confidence: number;
  };
  summary: string;
  entities: NoticeEntities;
  actions: string[];
  keywords: string[];
  explanation: string[];
  explanation_factors: ExplanationFactors;
}

export interface Task {
  id: string;
  title: string;
  notice_id?: string;
  deadline?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  risk_score: number;
  risk_level: ImportanceLevel;
  user_id?: string;
  created_at: string;
  completed_at?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notice_id?: string;
  importance_score?: number;
  type: string;
  read: boolean;
  created_at: string;
}

export interface AnalyticsData {
  total_notices: number;
  critical_notices: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  upcoming_deadlines: number;
  notices_this_week: number;
  categories: { category: string; count: number; percentage: number }[];
  importance_distribution: { level: string; count: number; color: string }[];
  urgency_distribution: { level: string; count: number; color: string }[];
  timeline: { date: string; count: number; critical_count: number }[];
}
