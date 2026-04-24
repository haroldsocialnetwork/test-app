# API Contracts — AI Recruitment Co-Pilot

> **Backend:** NestJS 10 · SQLite via Prisma 5 · Port `3998`  
> **Recruiter Frontend:** React 18 + Vite · Port `3999`  
> **HR Dashboard Frontend:** React 18 + Vite · Port `4000`

---

## Table of Contents

1. [Global Conventions](#1-global-conventions)
2. [Database Schema](#2-database-schema)
3. [Recruitment API](#3-recruitment-api)
   - [POST /api/recruitment/analyze](#post-apirecruitmentanalyze)
4. [HR Dashboard API](#4-hr-dashboard-api)
   - [GET /api/hr/dashboard](#get-apihrdashboard)
   - [GET /api/hr/candidates](#get-apihrcandidates)
   - [GET /api/hr/grouped](#get-apihrgrouped)
   - [POST /api/hr/chat](#post-apihrchat)
5. [Shared Data Models](#5-shared-data-models)
6. [Error Handling](#6-error-handling)
7. [Implementation Status](#7-implementation-status)

---

## 1. Global Conventions

| Property | Value |
|---|---|
| Base URL | `http://localhost:3998` |
| Content-Type (requests) | `application/json` — except file upload endpoints which use `multipart/form-data` |
| Content-Type (responses) | `application/json` |
| Auth | None (open — demo environment only) |
| CORS | `origin: *` — all origins allowed |
| Timeout | 28 s for AI-powered endpoints; standard for others |
| Date format | ISO 8601 — `2026-04-24T10:00:00.000Z` |

### Vite Proxy (frontend dev servers)

Both frontends proxy `/api/*` to the backend at port `3998`:

```
frontend  (port 3999): /api → http://localhost:3998
frontend_HR (port 4000): /api → http://localhost:3998
```

---

## 2. Database Schema

### Table: `CandidateAnalysis`

The central persistence model. Created on every successful call to `POST /api/recruitment/analyze`.

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `Int` PK autoincrement | — | Unique analysis record ID |
| `candidateName` | `String` | `"Unknown"` | Extracted from resume (best-effort) |
| `jobTitle` | `String` | `"Unknown Position"` | Extracted from job description (best-effort) |
| `jobDescription` | `String` | — | Full JD text as submitted |
| `matchScore` | `Int` | — | 0–100 integer |
| `strengths` | `String` | — | JSON-serialised `string[]` |
| `relevanceSummary` | `String` | — | 2–4 sentence narrative |
| `missingSkills` | `String` | — | JSON-serialised `string[]` |
| `unclearExperience` | `String` | — | JSON-serialised `string[]` |
| `qualificationGaps` | `String` | — | JSON-serialised `string[]` |
| `followUpMessage` | `String` | — | AI-generated candidate message |
| `tone` | `String` | — | One of `formal \| friendly \| concise` |
| `createdAt` | `DateTime` | `now()` | UTC timestamp |

> **Note:** Arrays are stored as JSON strings because SQLite has no native array type. The service layer serialises on write and parses on read.

---

## 3. Recruitment API

### `POST /api/recruitment/analyze`

Accepts a candidate resume (PDF upload or pasted text) and a job description, calls the Anthropic Claude AI, returns a structured analysis, and persists the result to `CandidateAnalysis`.

#### Request

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `resumeFile` | File (PDF) | Conditional* | Max 5 MB, `application/pdf` only | PDF resume upload |
| `resumeText` | String | Conditional* | Min 1 char (trimmed) | Pasted resume text |
| `jobDescription` | String | Yes | Min 10 chars | Job description text |
| `tone` | String | No | `formal \| friendly \| concise` | Follow-up message tone. Default: `friendly` |

*Exactly one of `resumeFile` or `resumeText` must be provided.

**Example — text paste:**
```
POST /api/recruitment/analyze
Content-Type: multipart/form-data

resumeText=John Doe, Senior React Developer with 6 years...
jobDescription=We are looking for a Senior React Developer...
tone=friendly
```

**Example — PDF upload:**
```
POST /api/recruitment/analyze
Content-Type: multipart/form-data

resumeFile=<PDF binary>
jobDescription=We are looking for a Senior React Developer...
tone=concise
```

#### Response — Success `200 OK`

```json
{
  "success": true,
  "error": null,
  "data": {
    "matchScore": 82,
    "strengths": [
      "6 years of production React experience closely matching the 5+ year requirement",
      "TypeScript proficiency demonstrated across 3 enterprise projects",
      "Team lead experience aligns with the senior-level expectation"
    ],
    "relevanceSummary": "John presents a strong match for the Senior React Developer role. His experience directly addresses the core technical requirements, and his leadership background is an added asset. The main gap is the absence of GraphQL experience, which the role lists as a requirement.",
    "missingInformation": {
      "missingSkills": [
        "GraphQL — listed as required in JD but not mentioned in resume",
        "Testing frameworks (Jest/Cypress) not referenced"
      ],
      "unclearExperience": [
        "Role at Acme Corp (2021–2023) lacks measurable outcomes or team size"
      ],
      "qualificationGaps": [
        "Bachelor's degree in CS listed as preferred — not mentioned in resume"
      ]
    },
    "followUpMessage": "Hi John, thank you for applying! Your React and TypeScript background is impressive. To complete your application, could you share your experience with GraphQL and any automated testing frameworks you've used? We'd also love to hear more about the scope and impact of your work at Acme Corp.",
    "tone": "friendly"
  }
}
```

#### Response Schema

| Field | Type | Description |
|---|---|---|
| `success` | `boolean` | Always `true` on success |
| `error` | `null` | Always null on success |
| `data.matchScore` | `integer` 0–100 | Overall fit score |
| `data.strengths` | `string[]` | Candidate strengths that align with the JD |
| `data.relevanceSummary` | `string` | 2–4 sentence narrative fit summary |
| `data.missingInformation.missingSkills` | `string[]` | Skills in JD not evidenced in resume |
| `data.missingInformation.unclearExperience` | `string[]` | Experience entries missing dates/scope/outcomes |
| `data.missingInformation.qualificationGaps` | `string[]` | Degrees/certifications not met or mentioned |
| `data.followUpMessage` | `string` | AI-drafted personalised message to the candidate |
| `data.tone` | `"formal" \| "friendly" \| "concise"` | Tone applied to the follow-up message |

#### Score Colour Tiers

| Score Range | Tier | UI Colour |
|---|---|---|
| 70–100 | High Fit | Green `#34d399` |
| 40–69 | Medium Fit | Amber `#fbbf24` |
| 0–39 | Low Fit | Red `#f87171` |

#### Error Responses

| HTTP Status | Trigger | `error` message |
|---|---|---|
| `400 Bad Request` | No resume provided | `"Please provide a resume — either upload a PDF or paste resume text."` |
| `400 Bad Request` | Non-PDF file uploaded | `"Only PDF files are accepted."` |
| `422 Unprocessable Entity` | PDF text extraction failed | `"Could not extract text from the uploaded PDF. Please paste your resume text directly instead."` |
| `504 Gateway Timeout` | AI response > 28 s | `"The analysis took too long to complete. Please try again."` |
| `500 Internal Server Error` | AI returned invalid JSON or unknown error | `"An unexpected error occurred. Please try again."` |

**Error envelope:**
```json
{
  "success": false,
  "data": null,
  "error": "Only PDF files are accepted."
}
```

#### Side Effects

- On success, a `CandidateAnalysis` record is written to SQLite (fire-and-forget; DB write failure does NOT fail the API response — it is logged as a warning only).

---

## 4. HR Dashboard API

All HR endpoints are read-only except `/api/hr/chat`.

### `GET /api/hr/dashboard`

Returns aggregated pipeline statistics across all analyzed candidates.

#### Request

No parameters.

```
GET /api/hr/dashboard
```

#### Response — `200 OK`

```json
{
  "total": 10,
  "avgScore": 68,
  "highFit": 4,
  "medFit": 5,
  "lowFit": 1
}
```

| Field | Type | Description |
|---|---|---|
| `total` | `integer` | Total candidate analyses in the database |
| `avgScore` | `integer` | Average match score across all candidates (rounded) |
| `highFit` | `integer` | Count of candidates with score ≥ 70 |
| `medFit` | `integer` | Count of candidates with score 40–69 |
| `lowFit` | `integer` | Count of candidates with score < 40 |

> Returns all zeros when no analyses have been recorded yet.

---

### `GET /api/hr/candidates`

Returns a paginated list of all analyzed candidates, ordered by most-recent first.

#### Request

| Query Param | Type | Default | Description |
|---|---|---|---|
| `page` | `integer` | `1` | Page number (1-indexed) |
| `limit` | `integer` | `50` | Results per page |

```
GET /api/hr/candidates?page=1&limit=50
```

#### Response — `200 OK`

```json
{
  "items": [
    {
      "id": 7,
      "candidateName": "Unknown",
      "jobTitle": "Unknown Position",
      "matchScore": 82,
      "tone": "friendly",
      "createdAt": "2026-04-24T10:00:00.000Z",
      "jobDescription": "We are looking for a Senior React Developer with..."
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 50
}
```

| Field | Type | Description |
|---|---|---|
| `items` | `CandidateRow[]` | Paginated array of candidates |
| `items[].id` | `integer` | Database record ID |
| `items[].candidateName` | `string` | Extracted name; `"Unknown"` if not detected |
| `items[].jobTitle` | `string` | Extracted title; `"Unknown Position"` if not detected |
| `items[].matchScore` | `integer` | 0–100 |
| `items[].tone` | `string` | Tone used when follow-up was generated |
| `items[].createdAt` | `string` | ISO 8601 UTC timestamp |
| `items[].jobDescription` | `string` | Full job description text |
| `total` | `integer` | Total records across all pages |
| `page` | `integer` | Current page number (echoed) |
| `limit` | `integer` | Page size (echoed) |

> **Note:** `candidateName` and `jobTitle` default to sentinel strings until structured extraction is implemented in the analyze flow.

---

### `GET /api/hr/grouped`

Returns candidates grouped by job description position, with per-candidate profile details including strong points, weak points, and tailored interview questions. This is the primary endpoint for the **By Position** view in the HR Dashboard.

#### Request

No parameters.

```
GET /api/hr/grouped
```

#### Behaviour

- If **no real data** exists in the database → returns hardcoded **dummy data** (3 jobs, 10 candidates).
- If **real data** exists → groups `CandidateAnalysis` records by job description (first 100 chars as grouping key), derives strong/weak points from stored analysis fields, and generates interview questions from identified weak points.

#### Response — `200 OK`

```json
{
  "jobs": [
    {
      "id": "job-1",
      "title": "Senior Frontend Engineer",
      "jobDescription": "Senior Frontend Engineer with 5+ years of React and TypeScript...",
      "candidateCount": 4,
      "avgScore": 62,
      "scoreDistribution": {
        "high": 2,
        "medium": 1,
        "low": 1
      },
      "candidates": [
        {
          "id": 1,
          "name": "Alice Chen",
          "matchScore": 88,
          "strongPoints": [
            "5+ years React with advanced patterns (hooks, context, portals)",
            "TypeScript proficiency across multiple enterprise projects",
            "Led a team of 6 frontend engineers for 2 years"
          ],
          "weakPoints": [
            "No backend or Node.js experience mentioned in resume",
            "GraphQL not referenced — role requires GraphQL API integration",
            "No automated testing mentioned (Jest, Cypress, RTL)"
          ],
          "interviewQuestions": [
            "Walk me through the most complex React architecture you've designed — how did you structure state and data flow?",
            "Describe a performance bottleneck you identified and resolved in a production React app.",
            "The role involves GraphQL. How quickly can you get up to speed, and what's your plan for learning it?",
            "How do you approach a testing strategy for a large component library?",
            "Tell me about a time your technical decision significantly impacted the team's velocity."
          ]
        }
      ]
    }
  ]
}
```

#### Response Schema

| Field | Type | Description |
|---|---|---|
| `jobs` | `JobGroup[]` | Array of job positions |
| `jobs[].id` | `string` | Unique job group ID (e.g. `"job-1"`) |
| `jobs[].title` | `string` | Job title (from `jobTitle` field or first 60 chars of JD) |
| `jobs[].jobDescription` | `string` | Full job description text |
| `jobs[].candidateCount` | `integer` | Number of candidates in this group |
| `jobs[].avgScore` | `integer` | Average match score for this position |
| `jobs[].scoreDistribution.high` | `integer` | Count with score ≥ 70 |
| `jobs[].scoreDistribution.medium` | `integer` | Count with score 40–69 |
| `jobs[].scoreDistribution.low` | `integer` | Count with score < 40 |
| `jobs[].candidates` | `CandidateDetail[]` | Candidates for this position |
| `jobs[].candidates[].id` | `integer` | Database record ID |
| `jobs[].candidates[].name` | `string` | Candidate name |
| `jobs[].candidates[].matchScore` | `integer` | 0–100 fit score |
| `jobs[].candidates[].strongPoints` | `string[]` | Key strengths relative to the role (max 5) |
| `jobs[].candidates[].weakPoints` | `string[]` | Gaps and areas to probe (max 5) |
| `jobs[].candidates[].interviewQuestions` | `string[]` | Tailored interview questions (max 5) |

#### Dummy Data Summary (returned when DB is empty)

| Position | Candidates | Avg Score | High/Med/Low |
|---|---|---|---|
| Senior Frontend Engineer | 4 (Alice Chen, David Park, Sofia Rodriguez, James Liu) | 62 | 2/1/1 |
| Product Manager — B2B SaaS | 3 (Priya Sharma, Marcus Johnson, Emma Walsh) | 69 | 1/2/0 |
| Senior Data Engineer | 3 (Ravi Krishnan, Yuki Tanaka, Chris Nguyen) | 71 | 2/1/0 |

---

### `POST /api/hr/chat`

AI assistant endpoint for HR managers to ask questions about a specific candidate. Currently returns **keyword-matched dummy responses** derived from the candidate's stored profile data. Full AI integration is planned for a future iteration.

#### Request

**Content-Type:** `application/json`

```json
{
  "candidateId": 1,
  "message": "What are their key strengths?",
  "conversationHistory": [
    { "role": "user", "content": "Tell me about Alice" },
    { "role": "assistant", "content": "Alice Chen is a Senior Frontend..." }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `candidateId` | `integer` | Yes | ID of the candidate to query (matches `CandidateAnalysis.id` or dummy data ID) |
| `message` | `string` | Yes | HR manager's question or instruction |
| `conversationHistory` | `Array<{role, content}>` | No | Prior turns in the conversation. `role` is `"user"` or `"assistant"`. Default: `[]` |

#### Response — `200 OK`

```json
{
  "reply": "**Alice Chen's key strengths for Senior Frontend Engineer:**\n\n1. 5+ years React with advanced patterns (hooks, context, portals)\n2. TypeScript proficiency across multiple enterprise projects\n3. Led a team of 6 frontend engineers for 2 years\n4. Reduced bundle size by 40% through code splitting and lazy loading\n5. Strong design-system and component-library experience\n\nThese demonstrate a strong alignment with the role requirements.",
  "candidateId": 1,
  "timestamp": "2026-04-24T10:30:00.000Z"
}
```

| Field | Type | Description |
|---|---|---|
| `reply` | `string` | AI-generated response. Supports lightweight markdown: `**bold**` and `\n` newlines |
| `candidateId` | `integer` | Echoed candidate ID |
| `timestamp` | `string` | ISO 8601 UTC response timestamp |

#### Keyword Routing (Dummy Implementation)

The current implementation matches the incoming `message` against keyword patterns and returns context-aware responses from the candidate's profile:

| Keywords matched (case-insensitive) | Response content |
|---|---|
| `strength`, `strong`, `good at`, `skill`, `excel`, `best` | Lists the candidate's `strongPoints` (numbered) |
| `weak`, `concern`, `gap`, `issue`, `probe`, `miss`, `lack` | Lists the candidate's `weakPoints` (numbered) |
| `interview`, `question`, `ask` | Returns all `interviewQuestions` (numbered) |
| `hire`, `recommend`, `advance`, `next stage`, `should we`, `decision`, `offer` | Score-based hiring recommendation with rationale |
| `score`, `match`, `fit`, `rating`, `percent` | Explains the match score with tier and key factors |
| `summar`, `overview`, `tell me about`, `who is`, `profile` | Concise candidate summary (score + top strength + top concern) |
| *(no match)* | Welcome prompt listing available query types |

#### Hiring Recommendation Logic

| Score | Recommendation |
|---|---|
| ≥ 80 | **Strongly Recommend ✓** — fast-track to next stage |
| 70–79 | **Recommend ✓** — proceed, probe one identified gap |
| 40–69 | **Proceed with Caution ⚠** — phone screen first |
| < 40 | **Not Recommended ✗** — consider for junior opening |

#### `conversationHistory` contract

The conversation history is accepted by the backend but currently **not used** in generating the dummy response — the reply is based solely on the current `message`. This field is included in the contract to ensure the interface is forward-compatible when real AI is wired in.

Expected format when real AI is integrated:
```json
[
  { "role": "user",      "content": "What are Alice's strengths?" },
  { "role": "assistant", "content": "Alice Chen's key strengths are..." },
  { "role": "user",      "content": "Should we advance her?" }
]
```

---

## 5. Shared Data Models

### TypeScript Interfaces (Frontend — `src/types/hr.ts`)

```typescript
// ── Overview ──────────────────────────────────────────────────────
interface DashboardStats {
  total: number;
  avgScore: number;
  highFit: number;
  medFit: number;
  lowFit: number;
}

// ── Candidates list ────────────────────────────────────────────────
interface CandidateRow {
  id: number;
  candidateName: string;
  jobTitle: string;
  matchScore: number;
  tone: string;
  createdAt: string;       // ISO 8601
  jobDescription: string;
}

interface CandidatesPage {
  items: CandidateRow[];
  total: number;
  page: number;
  limit: number;
}

// ── Grouped / By-Position ──────────────────────────────────────────
interface CandidateDetail {
  id: number;
  name: string;
  matchScore: number;
  strongPoints: string[];
  weakPoints: string[];
  interviewQuestions: string[];
}

interface JobScoreDistribution {
  high: number;
  medium: number;
  low: number;
}

interface JobGroup {
  id: string;
  title: string;
  jobDescription: string;
  candidateCount: number;
  avgScore: number;
  scoreDistribution: JobScoreDistribution;
  candidates: CandidateDetail[];
}

interface GroupedData {
  jobs: JobGroup[];
}

// ── Chat ───────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;       // ISO 8601
}

interface ChatRequest {
  candidateId: number;
  message: string;
  conversationHistory: Array<{ role: string; content: string }>;
}

interface ChatResponse {
  reply: string;
  candidateId: number;
  timestamp: string;       // ISO 8601
}
```

### NestJS Interfaces (Backend — `src/hr/hr.service.ts`)

```typescript
interface DashboardStats { total, avgScore, highFit, medFit, lowFit }
interface CandidateDetail { id, name, matchScore, strongPoints[], weakPoints[], interviewQuestions[] }
interface JobScoreDistribution { high, medium, low }
interface JobGroup { id, title, jobDescription, candidateCount, avgScore, scoreDistribution, candidates[] }
interface GroupedData { jobs: JobGroup[] }
```

---

## 6. Error Handling

### Recruitment API error envelope

```json
{
  "success": false,
  "data": null,
  "error": "<human-readable error message>"
}
```

### HR API errors

HR endpoints return standard NestJS HTTP exceptions (not wrapped in a success envelope):

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

### HTTP Status Code Reference

| Code | Meaning |
|---|---|
| `200` | Success |
| `400` | Bad request — validation failure or missing required field |
| `422` | Unprocessable entity — file parsing failed |
| `500` | Internal server error — unexpected exception |
| `504` | Gateway timeout — AI service did not respond within 28 s |

---

## 7. Implementation Status

| Endpoint | Status | Notes |
|---|---|---|
| `POST /api/recruitment/analyze` | ✅ Live | Full AI integration via Claude 3.5 Haiku. Results persisted to DB. |
| `GET /api/hr/dashboard` | ✅ Live | Reads real DB data. Returns zeros when empty. |
| `GET /api/hr/candidates` | ✅ Live | Paginated. Real DB data. |
| `GET /api/hr/grouped` | ✅ Live | Real DB data when available; falls back to dummy data when DB is empty. |
| `POST /api/hr/chat` | 🟡 Stub | Keyword-matched dummy responses. `conversationHistory` accepted but not yet used. **Real AI integration pending.** |

### Planned enhancements for `POST /api/hr/chat`

When real AI is integrated, the service should:
1. Retrieve the candidate's full `CandidateAnalysis` record from DB (or dummy profile).
2. Construct a system prompt injecting the candidate's strengths, weaknesses, summary, and JD context.
3. Pass `conversationHistory` as prior turns to the Anthropic messages API.
4. Stream or return the AI-generated reply.
5. Optionally store conversation history in a new `ChatHistory` table (schema not yet defined).
