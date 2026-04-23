# Quickstart: AI Recruitment Co-Pilot

**Date**: April 23, 2026
**Branch**: `001-ai-recruitment-copilot`

---

## Prerequisites

- Node.js 20+
- npm 9+
- An Anthropic API key (get one at https://console.anthropic.com)

---

## 1. Install New Backend Dependencies

```bash
cd backend
npm install @anthropic-ai/sdk pdf-parse multer
npm install -D @types/multer @types/pdf-parse
```

---

## 2. Configure Environment

Create `backend/.env` (already gitignored):

```env
DATABASE_URL="file:./prisma/dev.db"
ANTHROPIC_API_KEY="sk-ant-..."
```

---

## 3. Build and Start

```bash
# From the repo root:

# Backend (port 3001)
cd backend && npm run build && npm run start

# Frontend (port 3000) — in a second terminal
cd frontend && npm run build

# Or start both via PM2:
pm2 start ecosystem.config.cjs
```

The app is available at **http://localhost:3000**.

---

## 4. Demo Scenario

1. Open http://localhost:3000
2. In the **Resume** section, either:
   - Upload a PDF resume using the file picker, **or**
   - Click "Paste text instead" and paste resume content directly
3. In the **Job Description** field, paste a job description
4. Click **Analyze Candidate**
5. Review the results panel:
   - **Match Score** — numeric fit rating (0–100)
   - **Strengths** — key alignment points
   - **Missing Information** — skills, unclear experience, qualification gaps
   - **Follow-Up Message** — personalized draft message
6. Use the **Tone** selector to switch between `Formal`, `Friendly`, and `Concise`
7. Click **Copy Message** to copy the follow-up to the clipboard

---

## 5. Sample Test Data

**Sample Job Description** (paste into the JD field):

```
We are looking for a Senior Full-Stack Engineer to join our product team.

Requirements:
- 4+ years of experience with React and TypeScript
- Strong Node.js backend skills
- Experience with Docker and CI/CD pipelines
- Bachelor's degree in Computer Science or equivalent
- Experience leading small engineering teams (preferred)
```

**Sample Resume Text** (use as pasted text input):

```
Alex Johnson
alex@example.com | linkedin.com/in/alexj

EXPERIENCE
Acme Corp — Frontend Engineer (2021–present)
- Built customer-facing React 18 / TypeScript applications
- Led a team of 4 frontend developers
- Contributed to some backend work (2020–2021)

StartupXYZ — Junior Developer (2019–2020)
- Developed React components and REST API integrations

SKILLS
React, TypeScript, JavaScript, CSS, REST APIs, Git

EDUCATION
State University — B.S. Business Administration, 2019
```

**Expected approximate output**:
- Match Score: 60–75
- Strengths: React, TypeScript, team leadership
- Missing: Node.js, Docker, CI/CD; CS degree gap; unclear "backend work" scope
- Follow-up: requests Node.js details, Docker experience, clarification on backend role

---

## 6. Development Mode (Hot Reload)

```bash
# Backend hot reload
cd backend && npm run start:dev

# Frontend dev server
cd frontend && npm run dev
```

> Note: In dev mode, the frontend Vite server runs on port 3000 and proxies `/api/*` to `localhost:3001`. Verify `vite.config.ts` has the proxy configured (added as part of implementation).

---

## 7. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `401 Unauthorized` from analysis endpoint | Missing or invalid `ANTHROPIC_API_KEY` | Check `backend/.env` |
| "Could not extract text from PDF" error | Image-only PDF uploaded | Use "Paste text instead" |
| Analysis takes >30 seconds | Network latency to Anthropic API | Retry; check internet connection |
| Frontend shows blank page | Frontend not built | Run `cd frontend && npm run build` |
| CORS error in browser console | Backend not running | Ensure `cd backend && npm run start` is active |
