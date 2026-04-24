import { CandidateRow } from '../types/hr';

interface Props {
  candidates: CandidateRow[];
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  limit?: number;
}

function scoreClass(score: number) {
  if (score >= 70) return 'score-green';
  if (score >= 40) return 'score-amber';
  return 'score-red';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function jobDisplay(row: CandidateRow) {
  if (row.jobTitle !== 'Unknown Position') return row.jobTitle;
  return row.jobDescription.trim().slice(0, 60) + (row.jobDescription.length > 60 ? '…' : '');
}

export default function CandidatesTable({ candidates, total, currentPage, onPageChange, limit = 50 }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section className="result-card">
      <h2 className="card-title">All Candidates</h2>
      {candidates.length === 0 ? (
        <p className="muted-text">No candidates analyzed yet. Use the recruiter tool to analyze a resume.</p>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="candidates-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Score</th>
                  <th>Tone</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((row) => (
                  <tr key={row.id}>
                    <td className="muted-text">{row.id}</td>
                    <td>{row.candidateName}</td>
                    <td className="job-cell">{jobDisplay(row)}</td>
                    <td>
                      <span className={`score-pill ${scoreClass(row.matchScore)}`}>
                        {row.matchScore}
                      </span>
                    </td>
                    <td className="tone-cell">{row.tone}</td>
                    <td className="muted-text">{formatDate(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="table-pagination">
              <button
                className="page-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                ← Prev
              </button>
              <span className="page-indicator">Page {currentPage} of {totalPages}</span>
              <button
                className="page-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
