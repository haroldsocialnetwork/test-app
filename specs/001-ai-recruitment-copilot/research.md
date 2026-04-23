# Research: AI Recruitment Co-Pilot

**Phase**: 0 — Research & Unknowns Resolution
**Date**: April 23, 2026
**Feature**: AI Recruitment Co-Pilot

---

## 1. Claude API — Structured JSON Output for Recruitment Analysis

**Decision**: Use `claude-3-5-haiku-20241022` as the default model with a single structured prompt that returns a JSON object containing all four analysis components in one API call.

**Rationale**:
- Haiku provides the best latency/cost balance for hackathon demo use; fits the ≤30s SC-002 constraint comfortably (typical response: 3–8 seconds).
- A single prompt call (rather than chained calls) minimizes latency, reduces complexity, and keeps implementation within the 5-hour build window.
- Claude 3.5 Haiku supports `tool_use` and direct JSON output. Using the `system` prompt to mandate JSON output with a strict schema is the simplest reliable approach without needing function-calling boilerplate.

**Prompt pattern**:

```
System: You are a recruitment AI. Always respond with valid JSON only — no markdown fences, no prose. Follow the exact schema provided.

User:
RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

TONE: {tone}  // "formal" | "friendly" | "concise"

Analyze the resume against the job description and return JSON with this exact structure:
{
  "matchScore": <integer 0-100>,
  "strengths": [<string>, ...],
  "relevanceSummary": <string>,
  "missingInformation": {
    "missingSkills": [<string>, ...],
    "unclearExperience": [<string>, ...],
    "qualificationGaps": [<string>, ...]
  },
  "followUpMessage": <string>
}
```

**Alternatives considered**:
- Separate calls per component (score → gaps → message): Rejected — 3–4× the latency and API calls; unnecessary for MVP.
- `claude-3-5-sonnet`: Higher quality but 2–3× slower and more expensive; quality difference not meaningful for hackathon demo.
- Function/tool calling: Valid but adds boilerplate; direct JSON via system prompt is simpler for this scope.

---

## 2. PDF Text Extraction in Node.js

**Decision**: Use the `pdf-parse` npm package (`^1.1.1`) for server-side PDF text extraction in the NestJS backend.

**Rationale**:
- `pdf-parse` is a pure-JavaScript library (no native binaries, no system dependencies), making it trivially installable in any environment without build tooling.
- It handles standard text-selectable PDFs reliably, which covers the MVP assumption (image-only PDFs explicitly out of scope).
- Returns plain text string directly, which maps cleanly to the resume_text slot in the Claude prompt.
- Widely used (10M+ weekly downloads), well-maintained, no security concerns for server-side use.

**Alternatives considered**:
- `pdfjs-dist`: Browser-focused; heavier bundle, more complex async extraction for server use. Rejected.
- `pdf2json`: Returns structured JSON of PDF elements; more than needed for this use case. Rejected.
- `poppler` (system tool via child_process): Requires system dependency; not viable in all deployment environments. Rejected.

**Size limit**: Enforce a 5MB upload limit via multer to prevent large files from blocking the request pipeline.

---

## 3. NestJS File Upload Handling (multipart/form-data)

**Decision**: Use NestJS built-in `FileInterceptor` from `@nestjs/platform-express` (already installed) with `multer` configured for memory storage (no disk writes).

**Rationale**:
- `@nestjs/platform-express` ships with multer integration; no additional packages beyond `@types/multer` for TypeScript types.
- `memoryStorage()` keeps the uploaded file as a `Buffer` in memory — ideal for short-lived processing where the file is immediately parsed and discarded (no temp files, no cleanup needed, aligns with session-only data principle).
- The controller receives the file as `Express.Multer.File` with `file.buffer` available for `pdf-parse` directly.

**Implementation sketch**:
```typescript
@Post('analyze')
@UseInterceptors(FileInterceptor('resumeFile', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
async analyze(
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: AnalyzeCandidateDto,
) { ... }
```

**Alternatives considered**:
- `diskStorage`: Creates temp files that need cleanup. Rejected — adds complexity for no benefit.
- Multer as standalone middleware: Works but bypasses NestJS interceptor DI pattern. Rejected.

---

## 4. Claude API Token Budget

**Decision**: A standard resume (500–1000 words) + job description (200–400 words) uses approximately 1,000–1,800 input tokens. Claude 3.5 Haiku's context window (200K tokens) is not a constraint. No chunking or truncation logic is needed for MVP.

**Rationale**:
- Average English resume: ~600 words ≈ 750 tokens
- Average job description: ~300 words ≈ 375 tokens
- System prompt + output: ~500 tokens
- Total per analysis: ~1,600–2,600 tokens well within limits.
- At Haiku pricing ($0.80/MTok input, $4/MTok output), each analysis costs < $0.01.

**Alternatives considered**:
- Implementing token counting and truncation: Not needed for typical resume/JD sizes. Deferred to future work.

---

## 5. Frontend: Tone Change Behavior (re-call vs. client-side switch)

**Decision**: On tone change, re-call the backend API with the new tone value. Do not attempt to regenerate the message client-side.

**Rationale**:
- The follow-up message is generated by Claude, which requires the full resume and JD context. Client-side regeneration is not possible without storing these on the frontend in a stateful way.
- Re-calling the API is simple and guarantees fresh, context-aware output for each tone. Given Claude Haiku's fast response (3–8s), UX impact is acceptable.
- Caching the last resume+JD inputs in React state (not localStorage, not server) enables re-call without re-upload.

**Alternatives considered**:
- Storing all three tone variants in the initial response: Increases initial latency; wastes API cost for tones the user never selects. Rejected for MVP.
- Client-side template substitution: Cannot reproduce Claude's contextual tone nuance. Rejected.

---

## 6. Environment Variables

**Decision**: `ANTHROPIC_API_KEY` loaded via NestJS `ConfigModule` from a `.env` file at `backend/.env`.

**Security note**: The API key is never exposed to the frontend. All Claude API calls are server-side only. The `.env` file is already in `.gitignore` (standard NestJS scaffold convention).

---

## Resolved Unknowns Summary

| Unknown | Resolution |
|---------|-----------|
| Claude model + prompt strategy | `claude-3-5-haiku-20241022`, single call, JSON-only system prompt |
| PDF extraction library | `pdf-parse` with memory storage |
| NestJS file upload | `FileInterceptor` + `memoryStorage()` |
| Token budget | No constraint for typical resume/JD sizes |
| Tone change UX | Re-call API with cached inputs |
| API key handling | Server-side only via `ANTHROPIC_API_KEY` env var |
