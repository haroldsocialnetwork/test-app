import { useState } from 'react';
import { JobList } from '../components/JobList';
import { ApplicationForm } from '../components/ApplicationForm';
import { ApplicationConfirmation } from '../components/ApplicationConfirmation';
import type { Job } from '../types/recruitment';

type ApplicantStep = 'job-list' | 'application-form' | 'confirmation';

export default function ApplicantPage() {
  const [step, setStep] = useState<ApplicantStep>('job-list');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  function handleApply(job: Job) {
    setSelectedJob(job);
    setStep('application-form');
  }

  function handleSubmitted() {
    setStep('confirmation');
  }

  function handleApplyAnother() {
    setSelectedJob(null);
    setStep('job-list');
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">AI Recruitment Co-Pilot</h1>
        <p className="app-subtitle">Browse open roles and submit your application</p>
      </header>

      <main className="app-main">
        {step === 'job-list' && <JobList onApply={handleApply} />}
        {step === 'application-form' && selectedJob && (
          <ApplicationForm
            job={selectedJob}
            onBack={() => setStep('job-list')}
            onSubmitted={handleSubmitted}
          />
        )}
        {step === 'confirmation' && selectedJob && (
          <ApplicationConfirmation
            jobTitle={selectedJob.title}
            onReset={handleApplyAnother}
          />
        )}
      </main>
    </div>
  );
}
