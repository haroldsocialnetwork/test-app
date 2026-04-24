import { useState } from 'react';
import { GroupedData, JobGroup, CandidateDetail } from '../types/hr';
import CandidateCard from './CandidateCard';

interface Props {
  data: GroupedData;
  onOpenChat: (candidate: CandidateDetail, jobTitle: string) => void;
}

function scoreClass(score: number) {
  if (score >= 70) return 'score-green';
  if (score >= 40) return 'score-amber';
  return 'score-red';
}

function pct(n: number, total: number) {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

function JobMiniStats({ job }: { job: JobGroup }) {
  const { candidateCount, avgScore, scoreDistribution: d } = job;
  const tiers = [
    { label: 'High', count: d.high, mod: 'green' },
    { label: 'Med', count: d.medium, mod: 'amber' },
    { label: 'Low', count: d.low, mod: 'red' },
  ];

  return (
    <div className="job-stats-row">
      <div className="job-stat">
        <span className="job-stat-value">{candidateCount}</span>
        <span className="job-stat-label">Candidates</span>
      </div>
      <div className="job-stat">
        <span className={`job-stat-value ${scoreClass(avgScore)}`}>{avgScore}</span>
        <span className="job-stat-label">Avg Score</span>
      </div>
      <div className="job-mini-funnel">
        {tiers.map((tier) => (
          <div key={tier.mod} className="job-mini-tier">
            <div className="job-mini-bar-track">
              <div
                className={`job-mini-bar-fill job-mini-bar-fill--${tier.mod}`}
                style={{ width: `${pct(tier.count, candidateCount)}%` }}
              />
            </div>
            <span className={`job-mini-tier-label score-${tier.mod}`}>
              {tier.label}: {tier.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PositionsView({ data, onOpenChat }: Props) {
  const [selectedId, setSelectedId] = useState(data.jobs[0]?.id ?? '');
  const selectedJob = data.jobs.find((j) => j.id === selectedId) ?? data.jobs[0];

  if (!selectedJob) {
    return <p className="muted-text">No job positions found.</p>;
  }

  return (
    <div className="positions-view">
      <div className="job-tab-bar">
        {data.jobs.map((job) => (
          <button
            key={job.id}
            className={`job-tab ${selectedId === job.id ? 'job-tab--active' : ''}`}
            onClick={() => setSelectedId(job.id)}
          >
            <span className="job-tab-title">{job.title}</span>
            <span className={`job-tab-count ${selectedId === job.id ? 'job-tab-count--active' : ''}`}>
              {job.candidateCount}
            </span>
          </button>
        ))}
      </div>

      <div className="job-section">
        <div className="job-section-header">
          <div className="job-section-meta">
            <h2 className="job-section-title">{selectedJob.title}</h2>
            <p className="job-section-desc">
              {selectedJob.jobDescription.length > 160
                ? selectedJob.jobDescription.slice(0, 160) + '…'
                : selectedJob.jobDescription}
            </p>
          </div>
          <JobMiniStats job={selectedJob} />
        </div>

        <div className="candidate-grid">
          {selectedJob.candidates.map((c) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              onOpenChat={(candidate) => onOpenChat(candidate, selectedJob.title)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
