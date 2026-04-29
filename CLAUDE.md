# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project
**Dugout Log (덕아웃로그)**

A personal KBO baseball viewing diary. Users log pregame predictions and postgame results, recording watch type, player of the day, and mood tags. This is a **fan experience log**, not a sports stats or real-time scores app.

---

## Commands

```bash
npm run dev      # Start development server (Next.js)
npm run build    # Build for production
npm run lint     # Run ESLint
```

No test suite is configured.

---

## Architecture

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (auth + PostgreSQL)

### Routing (`app/`)
| Route | Purpose |
|---|---|
| `/` | Dashboard — prediction stats, win/loss record, recent logs |
| `/login` | Google auth entry point |
| `/add` | Pregame log form (prediction, watch type, expected player) |
| `/logs` | All logs list |
| `/logs/[id]` | Log detail view |
| `/logs/[id]/complete` | Postgame completion form (result, mood tags, player of the day) |
| `/insights` | Season analytics |

A game log has two phases: pregame (created at `/add`) and postgame (completed at `/logs/[id]/complete`). The `status` field (`"pre"` | `"post"`) tracks this.

### Data Layer (`lib/`)
- **`types.ts`** — Core types (`GameLog`, `WatchType`, `GameOutcome`, `LogStatus`) and KBO team list
- **`storage.ts`** — Supabase CRUD: `getLogs`, `getLogById`, `saveLog`, `deleteLog`, `generateId`
- **`prediction.ts`** — Prediction accuracy scoring and tier calculation
- **`supabase/client.ts`** — Browser-side Supabase client
- **`supabase/server.ts`** — Server-side Supabase client (for Server Components / Route Handlers)

### Auth
`middleware.ts` handles session refresh and route protection via Supabase auth. The auth callback is at `app/auth/callback/route.ts`.

### Database
Table: `game_logs` (snake_case columns). Column mapping from TypeScript camelCase to DB snake_case happens in `storage.ts`.

---

## Data Model

```ts
export type WatchType = "stadium" | "home" | "outside" | "highlights";
export type GameOutcome = "win" | "lose";
export type LogStatus = "pre" | "post";

export interface GameLog {
  id: string;
  date: string;
  seasonYear: number;
  myTeam: string;
  opponentTeam: string;
  watchType: WatchType;
  location: string;
  prediction: GameOutcome;
  result?: GameOutcome;          // set on completion
  expectedPlayer?: string;
  playerOfTheDay?: string;       // set on completion
  moodTags: string[];
  status: LogStatus;
  createdAt: string;
  updatedAt: string;
}
```

---

## Product Principles

1. **Keep it small** — PoC; don't add features unless explicitly requested.
2. **Mobile-first** — Users log on mobile; design for small screens.
3. **Fan experience, not analytics** — About how the user felt, not stats.
4. **Clean, warm UI** — Minimal and refined; avoid "sports app" clichés.

### Non-Goals (do not add unless explicitly requested)
- Backend beyond Supabase, external baseball APIs, real-time scores
- Social/multiplayer features, image upload, notifications
- Advanced charts, memo/freeform journaling
