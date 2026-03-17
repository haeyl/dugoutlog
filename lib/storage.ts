import { GameLog, GameOutcome, LogStatus, WatchType } from "./types";
import { createClient } from "./supabase/client";

// DB row shape (snake_case columns)
interface GameLogRow {
  id: string;
  user_id: string;
  status: LogStatus;
  date: string;
  season_year: number;
  my_team: string;
  opponent_team: string;
  watch_type: WatchType;
  location: string;
  prediction: GameOutcome;
  result: GameOutcome | null;
  player_of_the_day: string | null;
  mood_tags: string[];
  created_at: string;
  updated_at: string;
}

function rowToLog(row: GameLogRow): GameLog {
  return {
    id: row.id,
    status: row.status,
    date: row.date,
    seasonYear: row.season_year,
    myTeam: row.my_team,
    opponentTeam: row.opponent_team,
    watchType: row.watch_type,
    location: row.location,
    prediction: row.prediction,
    result: row.result ?? undefined,
    playerOfTheDay: row.player_of_the_day ?? undefined,
    moodTags: row.mood_tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getLogs(): Promise<GameLog[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("game_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error || !data) return [];
  return data.map(rowToLog);
}

export async function getLogById(id: string): Promise<GameLog | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("game_logs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;
  return rowToLog(data);
}

export async function saveLog(log: GameLog): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("game_logs").upsert(
    {
      id: log.id,
      user_id: user.id,
      status: log.status,
      date: log.date,
      season_year: log.seasonYear,
      my_team: log.myTeam,
      opponent_team: log.opponentTeam,
      watch_type: log.watchType,
      location: log.location,
      prediction: log.prediction,
      result: log.result ?? null,
      player_of_the_day: log.playerOfTheDay ?? null,
      mood_tags: log.moodTags ?? [],
      created_at: log.createdAt,
      updated_at: log.updatedAt,
    },
    { onConflict: "id" }
  );

  if (error) throw error;
}

export async function deleteLog(id: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("game_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
