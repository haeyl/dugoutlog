import { GameLog } from "./types";

export type PredictionTier =
  | "측정 중"
  | "입문"
  | "감 좋은 편"
  | "야구 감각 있음"
  | "경기 읽는 눈";

export interface PredictionStats {
  totalCount: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number; // 0–100
  currentStreak: number;
  bestStreak: number;
  recentFiveCorrect: number;
  recentFiveResults: boolean[]; // individual correct/incorrect for last up-to-5 games
  tier: PredictionTier;
}

export interface PredictionBreakdowns {
  myTeam: string | null;
  myTeamAccuracy: number | null;
  stadiumAccuracy: number | null;
  homeAccuracy: number | null;
}

export const TIER_CONFIG: Record<
  PredictionTier,
  { emoji: string; textClass: string; bgClass: string }
> = {
  "측정 중": {
    emoji: "📊",
    textClass: "text-label3",
    bgClass: "bg-fill",
  },
  "입문": {
    emoji: "🌱",
    textClass: "text-stone-500",
    bgClass: "bg-stone-100",
  },
  "감 좋은 편": {
    emoji: "🎯",
    textClass: "text-amber-600",
    bgClass: "bg-amber-50",
  },
  "야구 감각 있음": {
    emoji: "👁️",
    textClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
  },
  "경기 읽는 눈": {
    emoji: "🔮",
    textClass: "text-indigo-600",
    bgClass: "bg-indigo-50",
  },
};

export function getPredictionTier(
  totalCount: number,
  accuracy: number
): PredictionTier {
  if (totalCount < 5) return "측정 중";
  if (accuracy < 45) return "입문";
  if (accuracy < 55) return "감 좋은 편";
  if (accuracy < 65) return "야구 감각 있음";
  return "경기 읽는 눈";
}

export function calcPredictionStats(logs: GameLog[]): PredictionStats {
  // Only completed logs count toward prediction stats
  const completed = logs.filter((l) => l.status === "completed" && l.result !== undefined);

  // Sort chronologically (oldest first) for streak calculations
  const sorted = [...completed].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const totalCount = sorted.length;
  const correctCount = sorted.filter((l) => l.prediction === l.result).length;
  const incorrectCount = totalCount - correctCount;
  const accuracy =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  // Best streak (full history)
  let bestStreak = 0;
  let runningStreak = 0;
  for (const log of sorted) {
    if (log.prediction === log.result) {
      runningStreak++;
      if (runningStreak > bestStreak) bestStreak = runningStreak;
    } else {
      runningStreak = 0;
    }
  }

  // Current streak (from most recent backward)
  let currentStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].prediction === sorted[i].result) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Recent 5
  const recent5 = sorted.slice(-5);
  const recentFiveResults = recent5.map((l) => l.prediction === l.result);
  const recentFiveCorrect = recentFiveResults.filter(Boolean).length;

  const tier = getPredictionTier(totalCount, accuracy);

  return {
    totalCount,
    correctCount,
    incorrectCount,
    accuracy,
    currentStreak,
    bestStreak,
    recentFiveCorrect,
    recentFiveResults,
    tier,
  };
}

function subsetAccuracy(logs: GameLog[]): number | null {
  if (logs.length < 3) return null;
  const correct = logs.filter((l) => l.prediction === l.result).length;
  return Math.round((correct / logs.length) * 100);
}

export function calcPredictionBreakdowns(logs: GameLog[]): PredictionBreakdowns {
  // Only completed logs count toward breakdowns
  const completed = logs.filter((l) => l.status === "completed" && l.result !== undefined);

  // Derive user's primary team from most frequent myTeam value
  const teamCounts = completed.reduce<Record<string, number>>((acc, l) => {
    acc[l.myTeam] = (acc[l.myTeam] || 0) + 1;
    return acc;
  }, {});
  const myTeam =
    Object.entries(teamCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const myTeamLogs = myTeam ? completed.filter((l) => l.myTeam === myTeam) : [];
  const stadiumLogs = completed.filter((l) => l.watchType === "stadium");
  const homeLogs = completed.filter((l) => l.watchType === "home");

  return {
    myTeam,
    myTeamAccuracy: subsetAccuracy(myTeamLogs),
    stadiumAccuracy: subsetAccuracy(stadiumLogs),
    homeAccuracy: subsetAccuracy(homeLogs),
  };
}
