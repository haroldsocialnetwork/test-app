import { useState, useEffect, useCallback } from 'react';
import { AppState, GroupedData, CandidateDetail, ChatMessage } from '../types/hr';
import { fetchDashboard, fetchCandidates, fetchGrouped, sendChatMessage } from '../services/hrApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import OverviewStats from '../components/OverviewStats';
import PipelineFunnel from '../components/PipelineFunnel';
import CandidatesTable from '../components/CandidatesTable';
import JobsSummary from '../components/JobsSummary';
import PositionsView from '../components/PositionsView';
import ChatPanel from '../components/ChatPanel';

type View = 'positions' | 'overview';
const LIMIT = 50;

interface ChatSession {
  candidate: CandidateDetail;
  jobTitle: string;
}

const initialState: AppState = {
  status: 'loading',
  errorMessage: null,
  stats: null,
  candidates: [],
  totalCandidates: 0,
  currentPage: 1,
};

export default function HrDashboardPage() {
  const [view, setView] = useState<View>('positions');
  const [state, setState] = useState<AppState>(initialState);
  const [groupedData, setGroupedData] = useState<GroupedData | null>(null);
  const [groupedStatus, setGroupedStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Chat state
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [chatHistories, setChatHistories] = useState<Map<number, ChatMessage[]>>(new Map());
  const [chatSending, setChatSending] = useState(false);

  function updateState(patch: Partial<AppState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  const load = useCallback(async (page = 1) => {
    updateState({ status: 'loading', errorMessage: null });
    setGroupedStatus('loading');
    try {
      const [stats, pageData, grouped] = await Promise.all([
        fetchDashboard(),
        fetchCandidates(page, LIMIT),
        fetchGrouped(),
      ]);
      updateState({
        status: 'ready',
        stats,
        candidates: pageData.items,
        totalCandidates: pageData.total,
        currentPage: page,
      });
      setGroupedData(grouped);
      setGroupedStatus('ready');
    } catch {
      updateState({
        status: 'error',
        errorMessage: 'Failed to load dashboard data. Is the backend running?',
      });
      setGroupedStatus('error');
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  async function handlePageChange(page: number) {
    updateState({ status: 'loading' });
    try {
      const result = await fetchCandidates(page, LIMIT);
      updateState({
        status: 'ready',
        candidates: result.items,
        totalCandidates: result.total,
        currentPage: page,
      });
    } catch {
      updateState({ status: 'error', errorMessage: 'Failed to load candidates.' });
    }
  }

  // ── Chat handlers ──────────────────────────────────────────────────

  function handleOpenChat(candidate: CandidateDetail, jobTitle: string) {
    setChatSession({ candidate, jobTitle });
  }

  function handleCloseChat() {
    setChatSession(null);
  }

  async function handleSendMessage(message: string) {
    if (!chatSession || chatSending) return;

    const { candidate } = chatSession;
    const candidateId = candidate.id;
    const now = new Date().toISOString();

    const userMsg: ChatMessage = { role: 'user', content: message, timestamp: now };

    setChatHistories((prev) => {
      const updated = new Map(prev);
      const history = updated.get(candidateId) ?? [];
      updated.set(candidateId, [...history, userMsg]);
      return updated;
    });

    setChatSending(true);

    try {
      const currentHistory = chatHistories.get(candidateId) ?? [];
      const response = await sendChatMessage({
        candidateId,
        message,
        conversationHistory: currentHistory.map((m) => ({ role: m.role, content: m.content })),
      });

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        timestamp: response.timestamp,
      };

      setChatHistories((prev) => {
        const updated = new Map(prev);
        const history = updated.get(candidateId) ?? [];
        updated.set(candidateId, [...history, assistantMsg]);
        return updated;
      });
    } catch {
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setChatHistories((prev) => {
        const updated = new Map(prev);
        const history = updated.get(candidateId) ?? [];
        updated.set(candidateId, [...history, errMsg]);
        return updated;
      });
    } finally {
      setChatSending(false);
    }
  }

  const isLoading = state.status === 'loading';
  const hasError = state.status === 'error';
  const currentMessages = chatSession
    ? (chatHistories.get(chatSession.candidate.id) ?? [])
    : [];

  return (
    <div className="hr-dashboard">
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">HR Manager Dashboard</h1>
          <p className="app-subtitle">AI-powered recruitment pipeline</p>
          <div className="view-toggle-bar">
            <div className="view-tabs">
              <button
                className={`view-tab ${view === 'positions' ? 'view-tab--active' : ''}`}
                onClick={() => setView('positions')}
              >
                By Position
              </button>
              <button
                className={`view-tab ${view === 'overview' ? 'view-tab--active' : ''}`}
                onClick={() => setView('overview')}
              >
                Overview
              </button>
            </div>
            <button className="refresh-btn" onClick={() => load(1)} title="Refresh data">
              ↺ Refresh
            </button>
          </div>
        </header>

        {isLoading && <LoadingSpinner />}

        {hasError && (
          <ErrorBanner message={state.errorMessage!} onRetry={() => load(1)} />
        )}

        {!isLoading && !hasError && (
          <main className="app-main">
            {view === 'positions' && groupedStatus === 'ready' && groupedData && (
              <PositionsView data={groupedData} onOpenChat={handleOpenChat} />
            )}
            {view === 'overview' && state.status === 'ready' && state.stats && (
              <>
                <OverviewStats stats={state.stats} />
                <PipelineFunnel stats={state.stats} />
                <CandidatesTable
                  candidates={state.candidates}
                  total={state.totalCandidates}
                  currentPage={state.currentPage}
                  onPageChange={handlePageChange}
                  limit={LIMIT}
                />
                <JobsSummary candidates={state.candidates} />
              </>
            )}
          </main>
        )}

        {/* Chat panel — rendered outside main so it overlays everything */}
        {chatSession && (
          <ChatPanel
            candidate={chatSession.candidate}
            jobTitle={chatSession.jobTitle}
            messages={currentMessages}
            isSending={chatSending}
            isOpen={!!chatSession}
            onSend={handleSendMessage}
            onClose={handleCloseChat}
          />
        )}
      </div>
    </div>
  );
}
