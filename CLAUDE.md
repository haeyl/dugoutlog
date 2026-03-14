# CLAUDE.md

## Project
**Dugout Log (덕아웃로그)**

Dugout Log is a personal baseball viewing diary.
It helps the user record how they watched a baseball game, what they predicted before the game, what the actual result was, who stood out as the player of the day, and what emotions they felt.

This is **not** a baseball stats app.
This is **not** a live score or real-time sports data service.

It is a **fan experience log** centered on:
- watch type
- pre-game prediction
- post-game result
- player of the day
- mood tags

The product should feel personal, lightweight, and polished.

---

## Product Goal

Build a small but usable PoC that lets a single user:

1. add a baseball game log
2. record how they watched the game
3. record whether they predicted a win or loss
4. record the actual result
5. record player of the day
6. record mood tags
7. review past logs
8. see simple season insights

The goal is **not** feature breadth.
The goal is a **clear, realistic, polished MVP**.

---

## Core Product Principles

### 1. Keep it small
This is a first PoC.
Do not add unnecessary features unless explicitly requested.

### 2. Prioritize usability over complexity
The app should be easy to input and pleasant to review.

### 3. Focus on fan experience, not sports data depth
The app is about **how the user experienced the game**, not advanced baseball analytics.

### 4. Mobile-first
Assume the user will often log games on mobile.

### 5. Clean and polished UI
The interface should feel refined, minimal, and slightly warm.
Avoid over-designed “sports app” clichés.

---

## Non-Goals

Do **not** add these unless explicitly requested:
- authentication
- backend/database
- external baseball APIs
- real-time scores
- social features
- multiplayer/couple syncing
- image upload
- notifications
- advanced charts
- memo/freeform journaling beyond current scope

---

## MVP Scope

### Must Have
- create log
- edit log
- delete log
- logs list
- log detail page
- dashboard/home
- season insights
- localStorage persistence

### Fields
Each game log should contain:

#### Required
- `date`
- `seasonYear`
- `myTeam`
- `opponentTeam`
- `watchType`
- `location`
- `prediction`
- `result`
- `playerOfTheDay`
- `moodTags`

#### Optional
- `expectedPlayer`

There is **no memo field** in this PoC.

---

## Data Model

Use TypeScript types.

```ts
export type WatchType = "stadium" | "home" | "outside" | "highlights";
export type GameOutcome = "win" | "lose";

export interface GameLog {
  id: string;
  date: string;
  seasonYear: number;
  myTeam: string;
  opponentTeam: string;
  watchType: WatchType;
  location: string;
  prediction: GameOutcome;
  result: GameOutcome;
  expectedPlayer?: string;
  playerOfTheDay: string;
  moodTags: string[];
  createdAt: string;
  updatedAt: string;
}