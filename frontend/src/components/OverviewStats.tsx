import { DashboardStats } from '../types/hr';

interface Props {
  stats: DashboardStats;
}

function scoreClass(score: number) {
  if (score >= 70) return 'score-green';
  if (score >= 40) return 'score-amber';
  return 'score-red';
}

export default function OverviewStats({ stats }: Props) {
  return (
    <section className="result-card">
      <h2 className="card-title">Pipeline Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Analyzed</div>
        </div>
        <div className="stat-card">
          <div className={`stat-value ${scoreClass(stats.avgScore)}`}>{stats.avgScore}</div>
          <div className="stat-label">Avg Match Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value score-green">{stats.highFit}</div>
          <div className="stat-label">High Fit (&ge;70)</div>
        </div>
        <div className="stat-card stat-card--split">
          <div className="stat-split-row">
            <span className="stat-value-sm score-amber">{stats.medFit}</span>
            <span className="stat-split-label">Medium</span>
          </div>
          <div className="stat-split-row">
            <span className="stat-value-sm score-red">{stats.lowFit}</span>
            <span className="stat-split-label">Low</span>
          </div>
        </div>
      </div>
    </section>
  );
}
