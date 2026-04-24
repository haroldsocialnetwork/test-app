import { useState, useRef } from 'react';
import { ResumeInput } from './components/ResumeInput';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { AnalysisResults } from './components/AnalysisResults';
import { FollowUpMessage } from './components/FollowUpMessage';
import { analyzeCandidate } from './services/recruitmentApi';
import type { AnalysisResult, Tone, AppStatus } from './types/recruitment';

interface AppState {
  resumeText: string;
  resumeFile: File | null;
  jobDescription: string;
  tone: Tone;
  status: AppStatus;
  errorMessage: string | null;
  errorCode: number | null;
  result: AnalysisResult | null;
  jdError: string | null;
  resumeError: string | null;
  toneLoading: boolean;
}

const initialState: AppState = {
  resumeText: '',
  resumeFile: null,
  jobDescription: '',
  tone: 'friendly',
  status: 'idle',
  errorMessage: null,
  errorCode: null,
  result: null,
  jdError: null,
  resumeError: null,
  toneLoading: false,
};

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const resumeTextRef = useRef('');
  const resumeFileRef = useRef<File | null>(null);

  function updateState(patch: Partial<AppState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  function handleResumeFile(file: File | null) {
    resumeFileRef.current = file;
    updateState({ resumeFile: file, resumeError: null });
  }

  function handleResumeText(text: string) {
    resumeTextRef.current = text;
    updateState({ resumeText: text, resumeError: null });
  }

  function handleJobDescriptionChange(value: string) {
    updateState({ jobDescription: value, jdError: null });
  }

  async function handleAnalyze() {
    // Validate
    const jdTrimmed = state.jobDescription.trim();
    const resumeTextTrimmed = (resumeTextRef.current ?? '').trim();
    const file = resumeFileRef.current;

    let valid = true;
    const errors: Partial<AppState> = {};

    if (!jdTrimmed || jdTrimmed.length < 10) {
      errors.jdError = 'Please enter a job description (minimum 10 characters).';
      valid = false;
    }
    if (!file && !resumeTextTrimmed) {
      errors.resumeError = 'Please upload a PDF or paste resume text.';
      valid = false;
    }

    if (!valid) {
      updateState({ ...errors, status: 'validating' });
      return;
    }

    updateState({ status: 'analyzing', errorMessage: null, errorCode: null });

    const response = await analyzeCandidate({
      resumeFile: file ?? undefined,
      resumeText: resumeTextTrimmed || undefined,
      jobDescription: jdTrimmed,
      tone: state.tone,
    });

    if (response.success && response.data) {
      updateState({ status: 'results', result: response.data });
    } else {
      updateState({
        status: 'error',
        errorMessage: response.error ?? 'An unexpected error occurred. Please try again.',
      });
    }
  }

  async function handleToneChange(newTone: Tone) {
    if (!state.result) return;
    updateState({ tone: newTone, toneLoading: true });

    const jdTrimmed = state.jobDescription.trim();
    const resumeTextTrimmed = (resumeTextRef.current ?? '').trim();
    const file = resumeFileRef.current;

    const response = await analyzeCandidate({
      resumeFile: file ?? undefined,
      resumeText: resumeTextTrimmed || undefined,
      jobDescription: jdTrimmed,
      tone: newTone,
    });

    if (response.success && response.data) {
      updateState({
        toneLoading: false,
        result: {
          ...state.result!,
          followUpMessage: response.data.followUpMessage,
          tone: response.data.tone,
        },
      });
    } else {
      updateState({ toneLoading: false });
    }
  }

  function handleReset() {
    resumeTextRef.current = '';
    resumeFileRef.current = null;
    setState(initialState);
  }

  const isAnalyzing = state.status === 'analyzing';

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">AI Recruitment Co-Pilot</h1>
        <p className="app-subtitle">
          Instantly evaluate candidate fit and generate personalized follow-up messages
        </p>
        <p className="disclaimer-banner">
          ⚠️ Resume data is sent to an AI service for analysis and is not stored.
        </p>
      </header>

      <main className="app-main">
        {state.status !== 'results' && (
          <div className="input-panel">
            <ResumeInput
              onFileChange={handleResumeFile}
              onTextChange={handleResumeText}
              disabled={isAnalyzing}
            />
            {state.resumeError && (
              <p className="error-inline">{state.resumeError}</p>
            )}

            <JobDescriptionInput
              value={state.jobDescription}
              onChange={handleJobDescriptionChange}
              error={state.jdError}
              disabled={isAnalyzing}
            />

            {state.status === 'error' && state.errorMessage && (
              <div className="error-banner">
                <span>{state.errorMessage}</span>
                <button
                  type="button"
                  className="retry-btn"
                  onClick={handleAnalyze}
                >
                  Retry
                </button>
              </div>
            )}

            <button
              type="button"
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <span className="spinner" /> Analyzing…
                </>
              ) : (
                'Analyze Candidate'
              )}
            </button>
          </div>
        )}

        {state.status === 'results' && state.result && (
          <div className="results-panel">
            <AnalysisResults result={state.result} />
            <FollowUpMessage
              message={state.result.followUpMessage}
              tone={state.tone}
              onToneChange={handleToneChange}
              isLoading={state.toneLoading}
            />
            <button
              type="button"
              className="reset-btn"
              onClick={handleReset}
            >
              Analyze New Candidate
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

