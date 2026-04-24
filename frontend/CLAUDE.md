# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server on 0.0.0.0:3999
npm run build    # Production build to dist/
npm run preview  # Preview build on 0.0.0.0:3000
```

No test or lint scripts are configured.

## Architecture

React 18 + TypeScript + Vite SPA. The application is an AI Recruitment Co-Pilot: users paste/upload a resume and a job description, the backend analyzes them, and results (match score, strengths, gaps, follow-up message) are displayed.

**API proxy:** Vite proxies all `/api` requests to `http://localhost:3998` (the NestJS backend). The single API call is `POST /api/recruitment/analyze` with FormData.

**State management:** All application state lives in `App.tsx` as a single `AppState` object with a `status` discriminant (`idle | validating | analyzing | results | error`). There is no global state library.

**Component flow:**
```
App (state hub)
  ├── ResumeInput       — file upload or text paste toggle
  ├── JobDescriptionInput — textarea
  ├── AnalysisResults   — match score, strengths, gaps
  └── FollowUpMessage   — AI-generated message with tone switcher and copy button
```

**Services:** `src/services/recruitmentApi.ts` is a thin fetch wrapper — the only HTTP client in the app.

**Types:** All shared interfaces and enums (including `AnalysisResult`, `Tone`) are in `src/types/recruitment.ts`.

**Styling:** Single global CSS file `src/index.css`. Dark purple gradient theme, no component library or CSS-in-JS.
