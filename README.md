# Hello World — React + NestJS + Prisma

## Overview
A full-stack Hello World application demonstrating modern web development with:
- **React 18** (TypeScript + Vite) as the frontend
- **NestJS** as the REST API backend
- **Prisma ORM** with **SQLite** as the database

## Architecture
```
Browser (port 3000)
  │
  ├── GET  /            → React SPA (frontend/dist)
  ├── GET  /api/hello   → NestJS (port 3001) → Prisma → SQLite
  └── POST /api/hello   → NestJS (port 3001) → Prisma → SQLite
```

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/hello` | Fetch all messages from DB |
| POST | `/api/hello` | Create a new message (`{ text, author }`) |

## Project Structure
```
webapp/
├── backend/                  # NestJS application
│   ├── src/
│   │   ├── main.ts           # App bootstrap
│   │   ├── app.module.ts     # Root module
│   │   ├── prisma.service.ts # Prisma client singleton
│   │   └── hello/
│   │       ├── hello.controller.ts
│   │       ├── hello.service.ts
│   │       └── hello.module.ts
│   ├── prisma/
│   │   ├── schema.prisma     # Data model
│   │   └── dev.db            # SQLite database
│   └── package.json
│
├── frontend/                 # React application
│   ├── src/
│   │   ├── main.tsx          # Entry point
│   │   ├── App.tsx           # Main component
│   │   └── index.css         # Global styles
│   ├── index.html
│   └── package.json
│
├── server.cjs                # Node proxy server (port 3000)
├── ecosystem.config.cjs      # PM2 process manager config
└── README.md
```

## Data Model
```prisma
model Message {
  id        Int      @id @default(autoincrement())
  text      String
  author    String   @default("Server")
  createdAt DateTime @default(now())
}
```

## Running the App

### Start both services
```bash
cd /home/user/webapp
pm2 start ecosystem.config.cjs
```

### Rebuild after changes
```bash
# Backend
cd backend && npx nest build

# Frontend  
cd frontend && npm run build
```

### View logs
```bash
pm2 logs --nostream
```

## Features
- [x] React frontend with beautiful dark UI
- [x] NestJS REST API with two endpoints
- [x] Prisma ORM with SQLite
- [x] Send messages via form (stored in DB)
- [x] Real-time message feed from database
- [x] CORS enabled for cross-origin requests
- [x] Proxy server to unify ports
