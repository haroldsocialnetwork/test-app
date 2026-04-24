export type AppStatus = 'loading' | 'ready' | 'error';

export interface DashboardStats {
  total: number;
  avgScore: number;
  highFit: number;
  medFit: number;
  lowFit: number;
}

export interface CandidateRow {
  id: number;
  candidateName: string;
  jobTitle: string;
  matchScore: number;
  tone: string;
  createdAt: string;
  jobDescription: string;
}

export interface CandidatesPage {
  items: CandidateRow[];
  total: number;
  page: number;
  limit: number;
}

export interface AppState {
  status: AppStatus;
  errorMessage: string | null;
  stats: DashboardStats | null;
  candidates: CandidateRow[];
  totalCandidates: number;
  currentPage: number;
}

// ── Grouped / By-Position types ──────────────────────────────────────

export interface CandidateDetail {
  id: number;
  name: string;
  matchScore: number;
  strongPoints: string[];
  weakPoints: string[];
  interviewQuestions: string[];
}

export interface JobScoreDistribution {
  high: number;
  medium: number;
  low: number;
}

export interface JobGroup {
  id: string;
  title: string;
  jobDescription: string;
  candidateCount: number;
  avgScore: number;
  scoreDistribution: JobScoreDistribution;
  candidates: CandidateDetail[];
}

export interface GroupedData {
  jobs: JobGroup[];
}

// ── Chat types ────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  candidateId: number;
  message: string;
  conversationHistory: Array<{ role: string; content: string }>;
}

export interface ChatResponse {
  reply: string;
  candidateId: number;
  timestamp: string;
}
