# Data Model: AI Recruitment Co-Pilot

**Phase**: 1 — Design
**Date**: April 23, 2026
**Feature**: AI Recruitment Co-Pilot

> All entities below are **in-memory / session-scoped only** — no database schema changes are required. The existing Prisma `Message` model is unchanged.

---

## Entities

### 1. ResumeInput

Represents a candidate resume provided by the recruiter, either as a parsed PDF or direct text.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `source` | `"file" \| "text"` | Required | Discriminator for input mode |
| `text` | `string` | Required; non-empty | Extracted text content (from PDF or direct paste) |
| `originalFilename` | `string \| null` | Optional | Present only when source = "file" |

**Validation rules**:
- `text` must be non-empty after trimming whitespace
- If `source = "file"`, file must be a PDF with MIME type `application/pdf`
- File size ≤ 5 MB

---

### 2. JobDescription

Represents the role requirements provided by the recruiter.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `text` | `string` | Required; non-empty | Raw job description text pasted by recruiter |

**Validation rules**:
- `text` must be non-empty after trimming whitespace
- Minimum 10 characters (prevents trivially short JD from being submitted silently)

---

### 3. AnalyzeRequest

The composite input submitted to the backend for analysis.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `resumeText` | `string \| null` | Optional | Direct text paste; null when file uploaded |
| `resumeFile` | `multipart file` | Optional | PDF upload; null when text provided |
| `jobDescription` | `string` | Required; min 10 chars | |
| `tone` | `"formal" \| "friendly" \| "concise"` | Optional; default `"friendly"` | Tone for follow-up message |

**Validation rules**:
- At least one of `resumeText` or `resumeFile` must be provided
- `jobDescription` is always required

---

### 4. MissingInformation

Structured gap report produced from analysis.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `missingSkills` | `string[]` | Required; may be empty array | Skills listed in JD not evidenced in resume |
| `unclearExperience` | `string[]` | Required; may be empty array | Experience entries lacking dates, scope, or outcomes |
| `qualificationGaps` | `string[]` | Required; may be empty array | Degrees, certifications, or requirements not met |

---

### 5. AnalysisResult

The structured output returned to the frontend after AI processing.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `matchScore` | `number` | Integer 0–100 | AI-generated fit score |
| `strengths` | `string[]` | Required; min 1 element (when resume parsed successfully) | Key resume strengths aligned to JD |
| `relevanceSummary` | `string` | Required; non-empty | 2–4 sentence narrative explaining the score |
| `missingInformation` | `MissingInformation` | Required | See entity above |
| `followUpMessage` | `string` | Required; non-empty | AI-generated candidate follow-up draft |
| `tone` | `"formal" \| "friendly" \| "concise"` | Required | Echoed from request |

---

### 6. AnalyzeResponse (API envelope)

The HTTP response body returned by `POST /api/recruitment/analyze`.

| Field | Type | Notes |
|-------|------|-------|
| `success` | `boolean` | `true` on successful analysis |
| `data` | `AnalysisResult \| null` | Present when `success = true` |
| `error` | `string \| null` | Present when `success = false`; user-friendly message |

---

## State Transitions

```
[Idle]
  │
  ├─ recruiter submits resume + JD
  ▼
[Validating]
  │
  ├─ validation fails → [Error: ValidationError] → [Idle]
  │
  ├─ validation passes
  ▼
[Analyzing] ← AI call in progress; loading state shown
  │
  ├─ Claude API error / timeout → [Error: AIError] → [Idle]
  │
  ├─ PDF parse failure → [Error: ParseError] → [Idle]
  │
  └─ success
       ▼
[ResultsReady]
  │
  ├─ recruiter changes tone → [Analyzing] (re-call with cached inputs)
  │
  ├─ recruiter copies message → [ResultsReady] (clipboard write, no state change)
  │
  └─ recruiter clicks "Analyze New Candidate" → [Idle] (state reset)
```

---

## Frontend State Shape (React)

```typescript
type AppState = {
  // Input
  resumeText: string;           // bound to textarea
  resumeFile: File | null;      // bound to file input
  jobDescription: string;       // bound to textarea
  tone: "formal" | "friendly" | "concise";

  // UI
  status: "idle" | "validating" | "analyzing" | "results" | "error";
  errorMessage: string | null;

  // Output
  result: AnalysisResult | null;
};
```

---

## Relationships

```
AnalyzeRequest
  ├── contains → ResumeInput (derived from resumeFile or resumeText)
  └── contains → JobDescription

AnalysisResult
  └── contains → MissingInformation

AnalyzeResponse
  └── wraps → AnalysisResult
```
