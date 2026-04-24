import { DashboardStats } from '../types/hr';

interface Props {
  stats: DashboardStats;
}

export default function PipelineFunnel({ stats }: Props) {
  const { total, highFit, medFit, lowFit } = stats;

  function pct(n: number) {
    return total === 0 ? 0 : Math.round((n / total) * 100);
  }

  const tiers = [
    { label: 'High Fit (≥70)', count: highFit, pct: pct(highFit), modifier: 'green' },
    { label: 'Medium Fit (40–69)', count: medFit, pct: pct(medFit), modifier: 'amber' },
    { label: 'Low Fit (<40)', count: lowFit, pct: pct(lowFit), modifier: 'red' },
  ];

  return (
    <section className="result-card">
      <h2 className="card-title">Score Distribution</h2>
      <div className="funnel-section">
        {tiers.map((tier) => (
          <div key={tier.modifier} className="funnel-row">
            <div className="funnel-row-label">
              <span className={`funnel-tier-name score-${tier.modifier}`}>{tier.label}</span>
              <span className="funnel-count">{tier.count} ({tier.pct}%)</span>
            </div>
            <div className="funnel-bar-track">
              <div
                className={`funnel-bar-fill funnel-bar-fill--${tier.modifier}`}
                style={{ width: `${tier.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
