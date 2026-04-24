import { useRef, useState } from 'react';
import { ResumeInput } from './ResumeInput';
import { submitApplication } from '../services/applicantApi';
import type { Job } from '../types/recruitment';

interface Props {
  job: Job;
  onBack: () => void;
  onSubmitted: () => void;
}

export function ApplicationForm({ job, onBack, onSubmitted }: Props) {
  const resumeFileRef = useRef<File | null>(null);
  const resumeTextRef = useRef('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFileChange(file: File | null) {
    resumeFileRef.current = file;
    setResumeError(null);
  }

  function handleTextChange(text: string) {
    resumeTextRef.current = text;
    setResumeError(null);
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    setEmailError(null);
  }

  async function handleSubmit() {
    const file = resumeFileRef.current;
    const text = resumeTextRef.current.trim();
    const trimmedEmail = email.trim();

    let valid = true;
    if (!trimmedEmail) {
      setEmailError('Please enter your email address so we can follow up if needed.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }
    if (!file && !text) {
      setResumeError('Please upload a PDF or paste your resume text.');
      valid = false;
    }
    if (!valid) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const response = await submitApplication(job.id, file ?? undefined, text || undefined, trimmedEmail);

    setIsSubmitting(false);

    if (response.success) {
      onSubmitted();
    } else {
      setSubmitError(response.error ?? 'Submission failed. Please try again.');
    }
  }

  return (
    <div className="application-form">
      <button type="button" className="back-link" onClick={onBack}>
        ← Back to Jobs
      </button>

      <div className="application-form-header">
        <h2 className="application-form-title">Apply for: {job.title}</h2>
        <p className="application-form-subtitle">
          Attach your resume below to submit your application.
        </p>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="applicant-email">
          Your Email Address <span className="required-star">*</span>
        </label>
        <input
          id="applicant-email"
          type="email"
          className={`form-input${emailError ? ' form-input--error' : ''}`}
          placeholder="you@example.com"
          value={email}
          onChange={handleEmailChange}
          disabled={isSubmitting}
          autoComplete="email"
        />
        {emailError && <p className="error-inline">{emailError}</p>}
        <p className="form-hint">
          If your application has missing information, we'll send you a follow-up email.
        </p>
      </div>

      <ResumeInput
        onFileChange={handleFileChange}
        onTextChange={handleTextChange}
        disabled={isSubmitting}
      />

      {resumeError && <p className="error-inline">{resumeError}</p>}

      {submitError && (
        <div className="error-banner">
          <span>{submitError}</span>
        </div>
      )}

      <button
        type="button"
        className="analyze-btn"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="spinner" /> Submitting…
          </>
        ) : (
          'Submit Application'
        )}
      </button>
    </div>
  );
}
