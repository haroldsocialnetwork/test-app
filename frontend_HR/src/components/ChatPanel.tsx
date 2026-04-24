import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ChatMessage, CandidateDetail } from '../types/hr';

interface Props {
  candidate: CandidateDetail;
  jobTitle: string;
  messages: ChatMessage[];
  isSending: boolean;
  isOpen: boolean;
  onSend: (message: string) => void;
  onClose: () => void;
}

function scoreClass(score: number) {
  if (score >= 70) return 'score-green';
  if (score >= 40) return 'score-amber';
  return 'score-red';
}

function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.flatMap((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return [<strong key={i}>{part.slice(2, -2)}</strong>];
    }
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPanel({ candidate, jobTitle, messages, isSending, isOpen, onSend, onClose }: Props) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setInput('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const cls = scoreClass(candidate.matchScore);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`chat-backdrop ${isOpen ? 'chat-backdrop--visible' : ''}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`chat-panel ${isOpen ? 'chat-panel--open' : ''}`}>
        {/* Header */}
        <div className="chat-panel__header">
          <div className="chat-panel__candidate-info">
            <div className="chat-ai-badge">✦ AI Assistant</div>
            <div className="chat-candidate-name">{candidate.name}</div>
            <div className="chat-candidate-meta">
              <span className="chat-job-title">{jobTitle}</span>
              <span className={`chat-score ${cls}`}>{candidate.matchScore}/100</span>
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose} title="Close">✕</button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <div className="chat-welcome-icon">✦</div>
              <p className="chat-welcome-title">Ask me about {candidate.name}</p>
              <p className="chat-welcome-hint">Try asking about strengths, concerns, interview questions, or a hiring recommendation.</p>
              <div className="chat-suggestions">
                {[
                  'What are their key strengths?',
                  'What are the main concerns?',
                  'Should we advance them?',
                  'Suggest interview questions',
                ].map((s) => (
                  <button
                    key={s}
                    className="chat-suggestion-btn"
                    onClick={() => onSend(s)}
                    disabled={isSending}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg chat-msg--${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="chat-msg-avatar">✦</div>
              )}
              <div className="chat-msg-body">
                <div className="chat-msg-bubble">
                  {renderContent(msg.content)}
                </div>
                <div className="chat-msg-time">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="chat-msg chat-msg--assistant">
              <div className="chat-msg-avatar">✦</div>
              <div className="chat-msg-body">
                <div className="chat-msg-bubble chat-msg-bubble--thinking">
                  <span className="chat-dot" />
                  <span className="chat-dot" />
                  <span className="chat-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask anything about this candidate…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            rows={1}
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            title="Send (Enter)"
          >
            ↑
          </button>
        </div>
      </div>
    </>
  );
}
