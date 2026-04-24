# Tasks: AI Recruitment Co-Pilot

**Input**: Design documents from `specs/001-ai-recruitment-copilot/`
**Prerequisites**: plan.md ✓ spec.md ✓ research.md ✓ data-model.md ✓ contracts/api.md ✓ quickstart.md ✓
**Branch**: `001-ai-recruitment-copilot`
**Date**: April 24, 2026

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no incomplete-task dependencies)
- **[Story]**: User story label — US1, US2, US3, US4
- All paths are relative to repository root

---

## Phase 1: Setup

**Purpose**: Install new dependencies, configure environment variables, wire the dev proxy and CORS so backend and frontend can communicate during development.

- [x] T001 Install `@anthropic-ai/sdk`, `pdf-parse`, `multer`, `@types/multer`, `@types/pdf-parse` in `backend/package.json` via `npm install`
- [x] T002 [P] Create `backend/.env` with `DATABASE_URL` and `ANTHROPIC_API_KEY` placeholder, and create `backend/.env.example` with the same keys but no values
- [x] T003 [P] Add `/api` proxy to `localhost:3001` in `frontend/vite.config.ts`, and enable CORS for `http://localhost:3000` in `backend/src/main.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend module skeleton, shared TypeScript types, and the core Claude API + PDF extraction service. Every user story depends on this phase being complete before frontend story work begins.

**⚠️ CRITICAL**: No user story implementation can begin until T004–T010 are complete.

- [x] T004 Create `AnalyzeCandidateDto` class with fields `resumeText?: string`, `jobDescription: string`, `tone?: 'formal' | 'friendly' | 'concise'` with `class-validator` decorators in `backend/src/recruitment/dto/analyze-candidate.dto.ts`
- [x] T005 [P] Create shared TypeScript response types `AnalysisResult`, `MissingInformation`, `AnalyzeResponse` matching the contract schema in `frontend/src/types/recruitment.ts`
- [x] T006 [P] Create `RecruitmentModule` declaring `RecruitmentController` and `RecruitmentService` in `backend/src/recruitment/recruitment.module.ts`
- [x] T007 Import and register `RecruitmentModule` in `backend/src/app.module.ts` (depends on T006)
- [x] T008 Implement `RecruitmentService` in `backend/src/recruitment/recruitment.service.ts`: PDF text extraction via `pdf-parse` from a `Buffer`, and a single `@anthropic-ai/sdk` call to `claude-3-5-haiku-20241022` with the JSON-only system prompt defined in `research.md` returning the full `AnalysisResult` schema; throw typed errors for parse failure and AI timeout (depends on T004)
- [x] T009 Implement `RecruitmentController` in `backend/src/recruitment/recruitment.controller.ts` with `POST /api/recruitment/analyze` using `FileInterceptor('resumeFile', { storage: memoryStorage(), limits: { fileSize: 5MB } })`, wiring `UploadedFile` + `Body` dto to `RecruitmentService.analyze()`, and returning the `AnalyzeResponse` envelope with correct HTTP status codes per `contracts/api.md` (depends on T004, T006, T008)
- [x] T010 Create `recruitmentApi.ts` in `frontend/src/services/recruitmentApi.ts` as a `fetch` wrapper for `POST /api/recruitment/analyze` accepting `{ resumeFile?: File; resumeText?: string; jobDescription: string; tone: string }` and returning `Promise<AnalyzeResponse>` (depends on T005)

**Checkpoint**: Backend endpoint live — `POST /api/recruitment/analyze` returns full `AnalysisResult` JSON. Test with curl or Postman using sample data from `quickstart.md` before proceeding to user story phases.

---

## Phase 3: User Story 1 — Resume and Job Description Analysis (Priority: P1) 🎯 MVP

**Goal**: Recruiter submits a resume (PDF or pasted text) and a job description, clicks "Analyze Candidate," and sees a match score, strengths list, and relevance summary within 30 seconds.

**Independent Test**: Open the app, upload the sample PDF (or paste sample resume text from `quickstart.md`), paste the sample job description, click "Analyze Candidate." Verify the match score (0–100), non-empty strengths list, and relevance summary are displayed. Verify validation error appears when job description is empty.

- [x] T011 [P] [US1] Create `ResumeInput.tsx` in `frontend/src/components/ResumeInput.tsx` with two modes toggled by a link: (1) file picker accepting `application/pdf` up to 5 MB, (2) `<textarea>` for direct paste; expose `onFileChange(file: File | null)` and `onTextChange(text: string)` props
- [x] T012 [P] [US1] Create `JobDescriptionInput.tsx` in `frontend/src/components/JobDescriptionInput.tsx` with a `<textarea>` bound to `value`/`onChange` props and a visible label; show inline validation message when submitted empty
- [x] T013 [US1] Create `AnalysisResults.tsx` in `frontend/src/components/AnalysisResults.tsx` displaying: match score as a large badge (colour-coded: ≥70 green, 40–69 amber, <40 red), a "Strengths" section listing each strength as a bullet, and a "Relevance Summary" paragraph; accepts `result: AnalysisResult` prop (depends on T005)
- [x] T014 [US1] Replace `frontend/src/App.tsx` with the recruitment page: compose `ResumeInput`, `JobDescriptionInput`, an "Analyze Candidate" `<button>`, a loading spinner during the API call, an error banner for API errors, and `AnalysisResults` (shown only when `result` is available); manage `AppState` (see `data-model.md`) with `useState`; call `recruitmentApi.ts` on submit; cache `resumeText` and `jobDescription` in state for tone re-calls (depends on T010, T011, T012, T013)

**Checkpoint**: US1 fully functional and independently demonstrable. Match score, strengths, and relevance summary render for a real resume + JD. Validation errors appear for empty inputs.

---

## Phase 4: User Story 2 — Missing Information Detection (Priority: P2)

**Goal**: Below the relevance summary, the recruiter sees a structured "Missing Information" panel listing missing skills, unclear experience entries, and qualification gaps identified from the resume.

**Independent Test**: Run analysis with the incomplete sample resume from `quickstart.md`. Verify "Missing Information" section appears with at least one item in `missingSkills` and the `unclearExperience` flag on the vague "backend work" entry. Run with a closely matching resume and verify the section displays "No critical gaps identified."

- [x] T015 [US2] Extend `frontend/src/components/AnalysisResults.tsx` to render a "Missing Information" section below the relevance summary, with three subsections — "Missing Skills," "Unclear Experience," and "Qualification Gaps" — each rendered as a labelled bullet list; when all three arrays are empty, display "No critical gaps identified." (depends on T013)

**Checkpoint**: US1 + US2 both functional. Missing information panel renders accurately alongside the score and strengths. The full analysis result is now visible.

---

## Phase 5: User Story 3 — AI-Generated Follow-Up Message (Priority: P3)

**Goal**: After analysis, a personalized follow-up message auto-appears below the results. The recruiter selects a tone (formal / friendly / concise), the message regenerates, and one click copies it to the clipboard.

**Independent Test**: Complete analysis with gaps present. Verify follow-up message appears and references at least one identified gap. Switch to each of the three tones and verify the message text changes distinctly each time. Click "Copy Message" and verify clipboard contains the full message text.

- [x] T016 [P] [US3] Create `FollowUpMessage.tsx` in `frontend/src/components/FollowUpMessage.tsx` with: a `<pre>` or `<textarea readonly>` displaying `followUpMessage`; three tone radio/button controls (`formal` | `friendly` | `concise`) with the active tone highlighted; a "Copy Message" button that calls `navigator.clipboard.writeText()` and shows a transient "Copied!" confirmation; a loading state for when the tone re-call is in flight; accepts props `message: string`, `tone: Tone`, `onToneChange: (tone: Tone) => void`, `isLoading: boolean`
- [x] T017 [US3] Wire `FollowUpMessage` into `frontend/src/App.tsx`: add `tone` to `AppState` (default `'friendly'`); when tone changes call `recruitmentApi.ts` with cached `resumeText`/`jobDescription` and new tone, update `result.followUpMessage` and `result.tone` on success; add `FollowUpMessage` to the results section below `AnalysisResults` (depends on T014, T016)

**Checkpoint**: US1 + US2 + US3 all functional. Full demo scenario from `quickstart.md` runs end-to-end: analyze → view score/strengths/gaps → read follow-up message → switch tone → copy message.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Visual polish, refined error/retry UX, and session reset to make the demo flow smooth.

- [x] T018 [P] Add recruitment UI styles to `frontend/src/index.css`: score badge colours (green/amber/red), card panels for each results section, loading spinner animation, error banner style, tone button group, "Copied!" toast
- [x] T019 [P] Refine error handling UX in `frontend/src/App.tsx`: map HTTP 422 (PDF parse failure) to "Could not read PDF — please paste text instead" banner with the paste toggle pre-activated; map HTTP 504 to "Analysis timed out — please try again" with a retry button; map HTTP 500 to generic error with retry
- [x] T020 Add "Analyze New Candidate" reset button to `frontend/src/App.tsx` that clears all state back to `idle` — displayed only when `status === 'results'` (depends on T014)

---

## Dependencies (Story Completion Order)

```
Phase 1 (T001–T003)
  └─► Phase 2 Foundational (T004–T010)
        └─► Phase 3 US1 (T011–T014) ← MVP complete here
              └─► Phase 4 US2 (T015)
                    └─► Phase 5 US3 (T016–T017)
                          └─► Phase 6 Polish (T018–T020)
```

**Note**: US1, US2, and US3 share the same backend endpoint (T008/T009). The story separation is in the frontend — each phase adds a new section to the results UI. Each story's output is independently visible once the prior phase is complete.

---

## Parallel Execution Examples

### Phase 1 — after T001 completes:
```
T002 (backend .env)       T003 (Vite proxy + CORS)
```

### Phase 2 — T004 and T005 can run in parallel:
```
T004 (backend DTO)        T005 (frontend types)
T006 (RecruitmentModule)  ← after T004
T007 (register module)    ← after T006
T008 (service impl)       ← after T004
T009 (controller impl)    ← after T004, T006, T008
T010 (frontend API svc)   ← after T005
```

### Phase 3 — T011 and T012 can run in parallel:
```
T011 (ResumeInput.tsx)    T012 (JobDescriptionInput.tsx)
T013 (AnalysisResults.tsx) ← after T005 (types); T011/T012 logically prior
T014 (App.tsx wiring)     ← after T010, T011, T012, T013
```

### Phase 6 — T018 and T019 can run in parallel:
```
T018 (CSS styles)         T019 (error UX refinement)
T020 (reset button)       ← after T014
```

---

## Implementation Strategy

**MVP Scope (Priority)**: Complete Phases 1–3 first. At the end of Phase 3, the tool is fully demonstrable for the core hackathon value proposition — one resume in, structured analysis out.

**Incremental delivery**:
1. **Phase 1–2** → Verify backend endpoint returns correct JSON with `curl` or Postman
2. **Phase 3** → First live browser demo: score + strengths + summary visible
3. **Phase 4** → Second demo increment: missing information panel added
4. **Phase 5** → Full MVP: follow-up message with tone selector and copy
5. **Phase 6** → Demo-ready polish: clean UI, error handling, reset flow

**If time is short**: Skip Phase 6 entirely. The demo scenario in `quickstart.md` works without it.
