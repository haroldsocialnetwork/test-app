import type { AnalysisResult } from '../types/recruitment';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

function ScoreBadge({ score }: { score: number }) {
  const colorClass =
    score >= 70 ? 'score-green' : score >= 40 ? 'score-amber' : 'score-red';
  return (
    <div className={`score-badge ${colorClass}`}>
      <span className="score-number">{score}</span>
      <span className="score-label">/ 100</span>
    </div>
  );
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const { matchScore, strengths, relevanceSummary, missingInformation } = result;
  const { missingSkills, unclearExperience, qualificationGaps } = missingInformation;
  const hasGaps =
    missingSkills.length > 0 ||
    unclearExperience.length > 0 ||
    qualificationGaps.length > 0;

  return (
    <div className="results-container">
      {/* Match Score */}
      <div className="result-card score-card">
        <h2 className="card-title">Match Score</h2>
        <ScoreBadge score={matchScore} />
      </div>

      {/* Strengths */}
      <div className="result-card">
        <h2 className="card-title">Strengths</h2>
        {strengths.length > 0 ? (
          <ul className="bullet-list">
            {strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        ) : (
          <p className="muted-text">No specific strengths identified.</p>
        )}
      </div>

      {/* Relevance Summary */}
      <div className="result-card">
        <h2 className="card-title">Relevance Summary</h2>
        <p className="summary-text">{relevanceSummary}</p>
      </div>

      {/* Missing Information (US2) */}
      <div className="result-card">
        <h2 className="card-title">Missing Information</h2>
        {!hasGaps ? (
          <p className="no-gaps-text">✓ No critical gaps identified.</p>
        ) : (
          <div className="gaps-container">
            {missingSkills.length > 0 && (
              <div className="gap-section">
                <h3 className="gap-section-title">Missing Skills</h3>
                <ul className="bullet-list">
                  {missingSkills.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {unclearExperience.length > 0 && (
              <div className="gap-section">
                <h3 className="gap-section-title">Unclear Experience</h3>
                <ul className="bullet-list">
                  {unclearExperience.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {qualificationGaps.length > 0 && (
              <div className="gap-section">
                <h3 className="gap-section-title">Qualification Gaps</h3>
                <ul className="bullet-list">
                  {qualificationGaps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
