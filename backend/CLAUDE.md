# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev          # Start with hot reload (port 3001)
npm run build              # Compile TypeScript to dist/
npm start                  # Run compiled output

# Database
npm run prisma:generate    # Regenerate Prisma client after schema changes
npm run prisma:migrate     # Create and apply a migration
npm run prisma:db:push     # Push schema changes without migration (dev only)
npm run prisma:studio      # Open Prisma Studio GUI
```

No test suite is configured yet.

## Environment

Copy `.env.example` to `.env` before running:
```
DATABASE_URL="file:./prisma/dev.db"
ANTHROPIC_API_KEY=""       # Required for /api/recruitment/analyze
```

## Architecture

NestJS backend with SQLite (Prisma) and Anthropic Claude integration.

**Module structure:**
- `AppModule` → `HelloModule` + `RecruitmentModule`
- Shared `PrismaService` (`src/prisma.service.ts`) — singleton injected into any module that needs DB access

**HelloModule** (`src/hello/`) — Simple CRUD for `Message` records. Endpoints at `/api/hello`.

**RecruitmentModule** (`src/recruitment/`) — AI resume analysis. Single endpoint `POST /api/recruitment/analyze` accepts multipart form with optional PDF resume + JSON job description. Extracts PDF text via `pdf-parse`, calls Claude (`claude-3-5-haiku-20241022`) with a 28s timeout, returns structured JSON: `{ success, data: { matchScore, strengths, gaps, followUpMessage }, error }`.

**API conventions:**
- All routes prefixed with `/api` (set in `main.ts`)
- CORS enabled for all origins (wildcard)
- Port: `process.env.PORT ?? 3001`
- File uploads: memory storage, PDF only, 5 MB limit

## Database

SQLite via Prisma. Schema lives in `prisma/schema.prisma`. After any schema change, run `prisma:generate` and `prisma:migrate` (or `prisma:db:push` for quick dev iteration).

Current model: `Message { id, text, author, createdAt }`.

## Claude API usage

`RecruitmentService` uses `@anthropic-ai/sdk`. The prompt instructs Claude to return **only raw JSON** (no markdown, no prose). Response is parsed with `JSON.parse`; any failure surfaces as an `HttpException`.
