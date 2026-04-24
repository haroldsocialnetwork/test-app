export type Tone = 'formal' | 'friendly' | 'concise';

export interface MissingInformation {
  missingSkills: string[];
  unclearExperience: string[];
  qualificationGaps: string[];
}

export interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  relevanceSummary: string;
  missingInformation: MissingInformation;
  followUpMessage: string;
  tone: Tone;
}

export interface AnalyzeResponse {
  success: boolean;
  data: (AnalysisResult & { emailSent?: boolean; emailSentTo?: string }) | null;
  error: string | null;
}

export interface PendingApplication {
  id: number;
  jobId: number;
  applicantEmail: string | null;
  resumeText: string | null;
  createdAt: string;
  job: { title: string; description: string };
}

export type AppStatus = 'idle' | 'validating' | 'analyzing' | 'results' | 'error';

export interface Job {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

export interface JobsResponse {
  success: boolean;
  data: Job[];
  error: string | null;
}

export interface SubmitApplicationResponse {
  success: boolean;
  data: { id: number; jobId: number; createdAt: string } | null;
  error: string | null;
}

export interface AppState {
  resumeText: string;
  resumeFile: File | null;
  jobDescription: string;
  tone: Tone;
  status: AppStatus;
  errorMessage: string | null;
  result: AnalysisResult | null;
}
