import { CandidateRow } from '../types/hr';

interface Props {
  candidates: CandidateRow[];
}

interface JobGroup {
  snippet: string;
  count: number;
}

function groupByJob(candidates: CandidateRow[]): JobGroup[] {
  const map = new Map<string, number>();
  for (const c of candidates) {
    const key = c.jobDescription.trim().replace(/\s+/g, ' ').slice(0, 60);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([snippet, count]) => ({ snippet, count }))
    .sort((a, b) => b.count - a.count);
}

export default function JobsSummary({ candidates }: Props) {
  const groups = groupByJob(candidates);

  if (groups.length === 0) return null;

  return (
    <section className="result-card">
      <h2 className="card-title">Positions Analyzed</h2>
      <ul className="jobs-list">
        {groups.map((g) => (
          <li key={g.snippet} className="jobs-list__item">
            <span className="jobs-list__snippet">{g.snippet}{g.snippet.length >= 60 ? '…' : ''}</span>
            <span className="jobs-list__count">{g.count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
