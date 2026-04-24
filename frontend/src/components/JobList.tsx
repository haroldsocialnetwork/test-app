import { useEffect, useState } from 'react';
import { getJobs } from '../services/applicantApi';
import type { Job } from '../types/recruitment';

interface Props {
  onApply: (job: Job) => void;
}

export function JobList({ onApply }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJobs()
      .then((res) => {
        if (res.success) {
          setJobs(res.data);
        } else {
          setError(res.error ?? 'Failed to load job listings.');
        }
      })
      .catch(() => setError('Failed to load job listings.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="job-list-loading">
        <span className="spinner" /> Loading open positions…
      </div>
    );
  }

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  if (jobs.length === 0) {
    return <p className="job-list-empty">No open positions at this time.</p>;
  }

  return (
    <div className="job-list">
      <h2 className="job-list-heading">Open Positions</h2>
      {jobs.map((job) => (
        <div key={job.id} className="job-card">
          <div className="job-card-content">
            <h3 className="job-card-title">{job.title}</h3>
            <p className="job-card-description">{job.description}</p>
          </div>
          <button
            type="button"
            className="apply-btn"
            onClick={() => onApply(job)}
          >
            Apply
          </button>
        </div>
      ))}
    </div>
  );
}
