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
  data: AnalysisResult | null;
  error: string | null;
}

export type AppStatus = 'idle' | 'validating' | 'analyzing' | 'results' | 'error';

export interface AppState {
  resumeText: string;
  resumeFile: File | null;
  jobDescription: string;
  tone: Tone;
  status: AppStatus;
  errorMessage: string | null;
  result: AnalysisResult | null;
}
