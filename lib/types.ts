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

export const WATCH_TYPE_LABELS: Record<WatchType, string> = {
  stadium: "직관",
  home: "집관",
  outside: "외관",
  highlights: "하이라이트",
};

export const OUTCOME_LABELS: Record<GameOutcome, string> = {
  win: "승",
  lose: "패",
};

export const MOOD_TAG_OPTIONS = [
  "짜릿함",
  "아쉬움",
  "설렘",
  "분노",
  "뿌듯함",
  "감동",
  "지루함",
  "긴장",
  "행복",
  "허탈함",
];

export const KBO_TEAMS = [
  "LG 트윈스",
  "KT 위즈",
  "SSG 랜더스",
  "NC 다이노스",
  "두산 베어스",
  "KIA 타이거즈",
  "롯데 자이언츠",
  "삼성 라이온즈",
  "한화 이글스",
  "키움 히어로즈",
];
