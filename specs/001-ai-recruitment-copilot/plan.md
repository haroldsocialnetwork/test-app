# Implementation Plan: AI Recruitment Co-Pilot

**Branch**: `001-ai-recruitment-copilot` | **Date**: April 24, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-ai-recruitment-copilot/spec.md`

## Summary

Build an AI-powered recruitment evaluation tool on the existing React 18 + NestJS + Prisma stack. Applicants navigate to `/applicant` to browse open roles and submit a resume. HR recruiters navigate to `/hr` (a completely separate route) to review submitted applications and trigger AI analysis: match score (0–100), strengths list, missing information gaps, and an auto-generated personalized follow-up message with tone control. The frontend uses React Router (`react-router-dom`) with distinct routes for each audience — there is **no view-toggle UI**. No persistent storage is required for analysis results — they live for the browser session only.

## Technical Context

**Language/Version**: TypeScript 5.0 (frontend + backend)
**Primary Dependencies**: NestJS 10, React 18, Vite 5, Prisma 5 (existing); `@anthropic-ai/sdk` (Claude API), `pdf-parse` + `multer` (PDF upload/extraction), `@nestjs/platform-express` (already installed); `react-router-dom` v6 (client-side routing for `/applicant` and `/hr`)
**Storage**: Session-only — no database writes for analysis results; existing SQLite/Prisma retained for any future use
**Testing**: Manual test via demo scenario (hackathon scope; no automated test framework added)
**Target Platform**: Desktop web browser (Chrome/Firefox/Safari); Node.js 20 server
**Project Type**: Web application (frontend SPA + REST API backend)
**Performance Goals**: AI analysis response ≤ 30 seconds end-to-end (Claude API latency budget)
**Constraints**: Session-only data; no PII stored; single user; desktop only; 5-hour hackathon build window
**Scale/Scope**: Single recruiter user, demo environment, ~1 analysis at a time

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

> Constitution is a placeholder template (no project principles ratified). No gates apply. Proceeding without violations.

**Post-design re-check**: No new complexity introduced that would require constitution justification. The two-project structure (`backend/` + `frontend/`) mirrors the existing repository layout exactly.

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-recruitment-copilot/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # REST API contract
└── tasks.md             # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── app.module.ts            # Add RecruitmentModule import
│   ├── main.ts                  # No changes needed
│   ├── prisma.service.ts        # Existing — no changes
│   └── recruitment/
│       ├── recruitment.module.ts
│       ├── recruitment.controller.ts   # POST /api/recruitment/analyze
│       ├── recruitment.service.ts      # Claude API + PDF parsing logic
│       └── dto/
│           └── analyze-candidate.dto.ts
├── prisma/
│   └── schema.prisma            # No changes needed
└── package.json                 # Add: @anthropic-ai/sdk, pdf-parse, multer, @types/multer

frontend/
├── src/
│   ├── App.tsx                  # BrowserRouter root with routes:
│   │                            #   / → redirect to /applicant
│   │                            #   /applicant → <ApplicantPage>
│   │                            #   /hr → <HrPage>
│   │                            # view-toggle <div> and its buttons REMOVED
│   ├── pages/
│   │   ├── ApplicantPage.tsx    # Applicant flow: job-list → form → confirmation
│   │   └── HrPage.tsx           # HR flow: application list → analyze → results
│   ├── index.css                # Add recruitment UI styles
│   ├── services/
│   │   ├── recruitmentApi.ts   # fetch wrapper for POST /api/recruitment/analyze
│   │   └── applicantApi.ts     # fetch wrapper for applicant submission endpoints
│   └── components/
│       ├── ResumeInput.tsx      # File upload + text paste toggle
│       ├── JobDescriptionInput.tsx
│       ├── AnalysisResults.tsx  # Score, strengths, gaps display
│       ├── FollowUpMessage.tsx  # Tone selector + copy button
│       ├── JobList.tsx          # Browse open job listings
│       ├── ApplicationForm.tsx  # Submit resume for a selected job
│       └── ApplicationConfirmation.tsx
└── package.json                 # Add: react-router-dom
```

**Structure Decision**: Option 2 (Web application) — matches existing `backend/` + `frontend/` split exactly. New source files are added under `backend/src/recruitment/` and `frontend/src/` (pages/, components/, services/). `react-router-dom` is the only new frontend dependency. The `view` state and `switchView` logic in `App.tsx` are removed; URL-based routing replaces the in-component toggle entirely.

## Complexity Tracking

> No constitution violations. Section left blank per instructions.
