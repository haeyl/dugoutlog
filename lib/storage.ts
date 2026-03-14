import { GameLog } from "./types";

const STORAGE_KEY = "dugoutlog_gamelogs";

export function getLogs(): GameLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GameLog[];
  } catch {
    return [];
  }
}

export function saveLog(log: GameLog): void {
  const logs = getLogs();
  const idx = logs.findIndex((l) => l.id === log.id);
  if (idx >= 0) {
    logs[idx] = log;
  } else {
    logs.unshift(log);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function deleteLog(id: string): void {
  const logs = getLogs().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function getLogById(id: string): GameLog | undefined {
  return getLogs().find((l) => l.id === id);
}

export function seedMockData(mockLogs: GameLog[]): void {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockLogs));
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
