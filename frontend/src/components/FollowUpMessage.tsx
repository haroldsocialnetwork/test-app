import { useState } from 'react';
import type { Tone } from '../types/recruitment';

interface FollowUpMessageProps {
  message: string;
  tone: Tone;
  onToneChange: (tone: Tone) => void;
  isLoading: boolean;
}

const TONES: { value: Tone; label: string }[] = [
  { value: 'formal', label: 'Formal' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'concise', label: 'Concise' },
];

export function FollowUpMessage({
  message,
  tone,
  onToneChange,
  isLoading,
}: FollowUpMessageProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments where clipboard API isn't available
      const textArea = document.createElement('textarea');
      textArea.value = message;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="result-card follow-up-card">
      <div className="follow-up-header">
        <h2 className="card-title">Follow-Up Message</h2>
        <div className="tone-group" role="group" aria-label="Message tone">
          {TONES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`tone-btn ${tone === value ? 'tone-btn-active' : ''}`}
              onClick={() => onToneChange(value)}
              disabled={isLoading}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="tone-loading">
          <div className="spinner" />
          <span>Regenerating message…</span>
        </div>
      ) : (
        <textarea
          className="message-textarea"
          value={message}
          readOnly
          rows={7}
        />
      )}

      <button
        type="button"
        className={`copy-btn ${copied ? 'copy-btn-success' : ''}`}
        onClick={handleCopy}
        disabled={isLoading}
      >
        {copied ? '✓ Copied!' : 'Copy Message'}
      </button>
    </div>
  );
}
