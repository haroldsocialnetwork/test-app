import { useState } from 'react';
import { CandidateDetail } from '../types/hr';

interface Props {
  candidate: CandidateDetail;
  onOpenChat: (candidate: CandidateDetail) => void;
}

function scoreClass(score: number) {
  if (score >= 70) return 'score-green';
  if (score >= 40) return 'score-amber';
  return 'score-red';
}

function scoreLabel(score: number) {
  if (score >= 70) return 'High Fit';
  if (score >= 40) return 'Medium Fit';
  return 'Low Fit';
}

export default function CandidateCard({ candidate, onOpenChat }: Props) {
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const { name, matchScore, strongPoints, weakPoints, interviewQuestions } = candidate;
  const cls = scoreClass(matchScore);

  return (
    <div className={`candidate-card candidate-card--${cls}`}>
      <div className="candidate-card__header">
        <div className="candidate-name-block">
          <span className="candidate-name">{name}</span>
          <span className={`candidate-fit-label ${cls}`}>{scoreLabel(matchScore)}</span>
        </div>
        <div className="candidate-card__actions">
          <button
            className="ai-chat-btn"
            onClick={() => onOpenChat(candidate)}
            title="Ask AI about this candidate"
          >
            ✦ Ask AI
          </button>
          <span className={`score-pill ${cls}`}>{matchScore}</span>
        </div>
      </div>

      <div className="candidate-section">
        <div className="candidate-section-title candidate-section-title--strong">
          Strengths
        </div>
        <ul className="candidate-points">
          {strongPoints.map((pt, i) => (
            <li key={i} className="candidate-point candidate-point--strong">
              <span className="point-icon">✓</span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="candidate-section">
        <div className="candidate-section-title candidate-section-title--weak">
          Areas to Probe
        </div>
        <ul className="candidate-points">
          {weakPoints.map((pt, i) => (
            <li key={i} className="candidate-point candidate-point--weak">
              <span className="point-icon">✗</span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        className={`questions-toggle ${questionsOpen ? 'questions-toggle--open' : ''}`}
        onClick={() => setQuestionsOpen((o) => !o)}
      >
        <span className="questions-toggle-icon">{questionsOpen ? '▼' : '▶'}</span>
        <span>Interview Questions ({interviewQuestions.length})</span>
      </button>

      {questionsOpen && (
        <ol className="questions-list">
          {interviewQuestions.map((q, i) => (
            <li key={i} className="question-item">
              <span className="question-num">{i + 1}.</span>
              <span>{q}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
