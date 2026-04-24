import { DashboardStats, CandidatesPage, GroupedData, ChatRequest, ChatResponse } from '../types/hr';

export async function fetchDashboard(): Promise<DashboardStats> {
  const res = await fetch('/api/hr/dashboard');
  if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`);
  return res.json() as Promise<DashboardStats>;
}

export async function fetchCandidates(page: number, limit = 50): Promise<CandidatesPage> {
  const res = await fetch(`/api/hr/candidates?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`Candidates fetch failed: ${res.status}`);
  return res.json() as Promise<CandidatesPage>;
}

export async function fetchGrouped(): Promise<GroupedData> {
  const res = await fetch('/api/hr/grouped');
  if (!res.ok) throw new Error(`Grouped fetch failed: ${res.status}`);
  return res.json() as Promise<GroupedData>;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const res = await fetch('/api/hr/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
  return res.json() as Promise<ChatResponse>;
}
