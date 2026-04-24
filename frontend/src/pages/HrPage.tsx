import { useState, useRef } from 'react';
import { ResumeInput } from '../components/ResumeInput';
import { JobDescriptionInput } from '../components/JobDescriptionInput';
import { AnalysisResults } from '../components/AnalysisResults';
import { FollowUpMessage } from '../components/FollowUpMessage';
import { analyzeCandidate } from '../services/recruitmentApi';
import type { AnalysisResult, Tone, AppStatus } from '../types/recruitment';

interface HrState {
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

const initialHrState: HrState = {
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

export default function HrPage() {
  const [hrState, setHrState] = useState<HrState>(initialHrState);
  const resumeTextRef = useRef('');
  const resumeFileRef = useRef<File | null>(null);

  function updateHr(patch: Partial<HrState>) {
    setHrState((prev) => ({ ...prev, ...patch }));
  }

  function handleResumeFile(file: File | null) {
    resumeFileRef.current = file;
    updateHr({ resumeFile: file, resumeError: null });
  }

  function handleResumeText(text: string) {
    resumeTextRef.current = text;
    updateHr({ resumeText: text, resumeError: null });
  }

  function handleJobDescriptionChange(value: string) {
    updateHr({ jobDescription: value, jdError: null });
  }

  async function handleAnalyze() {
    const jdTrimmed = hrState.jobDescription.trim();
    const resumeTextTrimmed = (resumeTextRef.current ?? '').trim();
    const file = resumeFileRef.current;

    let valid = true;
    const errors: Partial<HrState> = {};

    if (!jdTrimmed || jdTrimmed.length < 10) {
      errors.jdError = 'Please enter a job description (minimum 10 characters).';
      valid = false;
    }
    if (!file && !resumeTextTrimmed) {
      errors.resumeError = 'Please upload a PDF or paste resume text.';
      valid = false;
    }

    if (!valid) {
      updateHr({ ...errors, status: 'validating' });
      return;
    }

    updateHr({ status: 'analyzing', errorMessage: null, errorCode: null });

    const response = await analyzeCandidate({
      resumeFile: file ?? undefined,
      resumeText: resumeTextTrimmed || undefined,
      jobDescription: jdTrimmed,
      tone: hrState.tone,
    });

    if (response.success && response.data) {
      updateHr({ status: 'results', result: response.data });
    } else {
      updateHr({
        status: 'error',
        errorMessage: response.error ?? 'An unexpected error occurred. Please try again.',
      });
    }
  }

  async function handleToneChange(newTone: Tone) {
    if (!hrState.result) return;
    updateHr({ tone: newTone, toneLoading: true });

    const jdTrimmed = hrState.jobDescription.trim();
    const resumeTextTrimmed = (resumeTextRef.current ?? '').trim();
    const file = resumeFileRef.current;

    const response = await analyzeCandidate({
      resumeFile: file ?? undefined,
      resumeText: resumeTextTrimmed || undefined,
      jobDescription: jdTrimmed,
      tone: newTone,
    });

    if (response.success && response.data) {
      updateHr({
        toneLoading: false,
        result: {
          ...hrState.result!,
          followUpMessage: response.data.followUpMessage,
          tone: response.data.tone,
        },
      });
    } else {
      updateHr({ toneLoading: false });
    }
  }

  function handleReset() {
    resumeTextRef.current = '';
    resumeFileRef.current = null;
    setHrState(initialHrState);
  }

  const isAnalyzing = hrState.status === 'analyzing';

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">AI Recruitment Co-Pilot</h1>
        <p className="app-subtitle">
          Instantly evaluate candidate fit and generate personalized follow-up messages
        </p>
      </header>

      <main className="app-main">
        <p className="disclaimer-banner">
          ⚠️ Resume data is sent to an AI service for analysis and is not stored.
        </p>

        {hrState.status !== 'results' && (
          <div className="input-panel">
            <ResumeInput
              onFileChange={handleResumeFile}
              onTextChange={handleResumeText}
              disabled={isAnalyzing}
            />
            {hrState.resumeError && (
              <p className="error-inline">{hrState.resumeError}</p>
            )}

            <JobDescriptionInput
              value={hrState.jobDescription}
              onChange={handleJobDescriptionChange}
              error={hrState.jdError}
              disabled={isAnalyzing}
            />

            {hrState.status === 'error' && hrState.errorMessage && (
              <div className="error-banner">
                <span>{hrState.errorMessage}</span>
                <button type="button" className="retry-btn" onClick={handleAnalyze}>
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

        {hrState.status === 'results' && hrState.result && (
          <div className="results-panel">
            <AnalysisResults result={hrState.result} />
            <FollowUpMessage
              message={hrState.result.followUpMessage}
              tone={hrState.tone}
              onToneChange={handleToneChange}
              isLoading={hrState.toneLoading}
            />
            <button type="button" className="reset-btn" onClick={handleReset}>
              Analyze New Candidate
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
