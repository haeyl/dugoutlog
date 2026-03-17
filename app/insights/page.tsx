"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLogs } from "@/lib/storage";
import { GameLog, WATCH_TYPE_LABELS, WatchType } from "@/lib/types";
import { calcPredictionStats, calcPredictionBreakdowns, TIER_CONFIG } from "@/lib/prediction";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { ChevronRight, LogOut } from "lucide-react";

export default function InsightsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setLogs(getLogs());
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  const completedLogs = logs.filter((l) => l.status === "completed");

  if (completedLogs.length === 0) {
    return (
      <div className="px-4 pt-12 pb-28">
        <h1 className="text-[28px] font-black text-label tracking-tight mb-1">내 덕아웃</h1>
        <p className="text-[12px] text-label2 mb-6">나의 야구 기록과 계정</p>
        <AccountCard user={user} onLogin={handleLogin} onLogout={handleLogout} />
        <div className="mt-3 flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-full bg-fill flex items-center justify-center text-2xl">
            📊
          </div>
          <div className="text-center">
            <p className="text-label2 text-sm font-medium">아직 인사이트가 없어요</p>
            <p className="text-label3 text-xs mt-1">경기 후 기록이 완료되면 통계가 나타나요.</p>
          </div>
        </div>
      </div>
    );
  }

  const wins = completedLogs.filter((l) => l.result === "win").length;
  const losses = completedLogs.length - wins;
  const winRate = Math.round((wins / completedLogs.length) * 100);

  const predStats = calcPredictionStats(logs);
  const predBreakdowns = calcPredictionBreakdowns(logs);
  const tierConfig = TIER_CONFIG[predStats.tier];

  const watchTypeCounts = completedLogs.reduce<Record<WatchType, number>>(
    (acc, l) => {
      acc[l.watchType] = (acc[l.watchType] || 0) + 1;
      return acc;
    },
    { stadium: 0, home: 0, outside: 0, highlights: 0 }
  );

  const watchTypeWinRates = (Object.keys(watchTypeCounts) as WatchType[])
    .filter((wt) => watchTypeCounts[wt] > 0)
    .map((wt) => {
      const total = watchTypeCounts[wt];
      const wtWins = completedLogs.filter(
        (l) => l.watchType === wt && l.result === "win"
      ).length;
      return { wt, total, winRate: Math.round((wtWins / total) * 100) };
    })
    .sort((a, b) => b.total - a.total);

  const moodCounts = completedLogs
    .flatMap((l) => l.moodTags ?? [])
    .reduce<Record<string, number>>((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
  const topMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const playerCounts = completedLogs.reduce<Record<string, number>>((acc, l) => {
    if (l.playerOfTheDay) acc[l.playerOfTheDay] = (acc[l.playerOfTheDay] || 0) + 1;
    return acc;
  }, {});
  const topPlayers = Object.entries(playerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const locationCounts = logs.reduce<Record<string, number>>((acc, l) => {
    const key = l.location.trim();
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const mostCommonLocation = topLocations[0];

  return (
    <div className="px-4 pt-12 pb-28">
      <h1 className="text-[28px] font-black text-label tracking-tight mb-1">내 덕아웃</h1>
      <p className="text-[12px] text-label2 mb-6">나의 야구 기록과 계정</p>

      {/* Account */}
      <section className="mb-3">
        <AccountCard user={user} onLogin={handleLogin} onLogout={handleLogout} />
      </section>

      {/* Season summary — Health style hero card */}
      <section className="mb-3">
        <div className="bg-surface rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-separator">
            <div className="flex items-center gap-2">
              <span className="text-primary">⚾</span>
              <p className="text-[15px] font-bold text-label">이번 시즌</p>
            </div>
            <ChevronRight size={16} className="text-label3" />
          </div>
          <div className="grid grid-cols-3 text-center divide-x divide-separator">
            <div className="py-5">
              <p className="text-[34px] font-black text-label tabular-nums leading-none">{completedLogs.length}</p>
              <p className="text-[11px] text-label2 mt-1.5">완료 경기</p>
            </div>
            <div className="py-5">
              <p className="text-[34px] font-black text-win tabular-nums leading-none">{wins}</p>
              <p className="text-[11px] text-label2 mt-1.5">승</p>
            </div>
            <div className="py-5">
              <p className="text-[34px] font-black text-lose tabular-nums leading-none">{losses}</p>
              <p className="text-[11px] text-label2 mt-1.5">패</p>
            </div>
          </div>
        </div>
      </section>

      {/* Win/Loss bar */}
      <section className="mb-3">
        <Card icon="🏆" title="승패 기록">
          <div>
            <div className="flex h-2.5 rounded-full overflow-hidden bg-fill mb-2.5">
              <div className="bg-win transition-all" style={{ width: `${winRate}%` }} />
              <div className="bg-lose transition-all" style={{ width: `${100 - winRate}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[12px] text-win font-semibold">
                  <span className="w-2 h-2 rounded-full bg-win" />{wins}승
                </span>
                <span className="flex items-center gap-1.5 text-[12px] text-lose font-semibold">
                  <span className="w-2 h-2 rounded-full bg-lose" />{losses}패
                </span>
              </div>
              <p className="text-[28px] font-black text-label tabular-nums leading-none">
                {winRate}
                <span className="text-base font-bold">%</span>
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Prediction Performance */}
      <section className="mb-3">
        <div className="bg-surface rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-separator">
            <div className="flex items-center gap-2">
              <span className="text-[15px]">{tierConfig.emoji}</span>
              <p className="text-[15px] font-bold text-label">예측 성적</p>
            </div>
            <span
              className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${tierConfig.bgClass} ${tierConfig.textClass}`}
            >
              {predStats.tier}
            </span>
          </div>

          <div className="px-5 py-4">
            {predStats.tier === "측정 중" ? (
              <div className="py-2">
                <p className="text-[14px] text-label2">
                  예측이 <span className="font-bold text-label">5경기</span> 이상 쌓이면 성적이 나타나요
                </p>
                <p className="text-[12px] text-label3 mt-1.5">
                  현재 {predStats.totalCount}경기 완료
                </p>
              </div>
            ) : (
              <>
                {/* Main accuracy + recent dots */}
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <p className="text-[36px] font-black text-primary tabular-nums leading-none">
                      {predStats.accuracy}
                      <span className="text-xl font-bold">%</span>
                    </p>
                    <p className="text-[11px] text-label2 mt-1.5">
                      {predStats.correctCount}번 적중 · {predStats.totalCount}경기
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5">
                      {predStats.recentFiveResults.map((correct, i) => (
                        <span
                          key={i}
                          className={`w-3 h-3 rounded-full ${correct ? "bg-primary" : "bg-stone-200"}`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-label2">
                      최근 {predStats.recentFiveResults.length}경기 {predStats.recentFiveCorrect}적중
                    </p>
                  </div>
                </div>

                {/* Correct/incorrect bar */}
                <div className="mb-5">
                  <div className="flex h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-primary transition-all"
                      style={{ width: `${predStats.accuracy}%` }}
                    />
                    <div
                      className="bg-stone-200 transition-all"
                      style={{ width: `${100 - predStats.accuracy}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-[12px] text-primary font-semibold">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {predStats.correctCount}적중
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px] text-label3 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-stone-200" />
                      {predStats.incorrectCount}빗나감
                    </span>
                  </div>
                </div>

                {/* Streaks */}
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  <div className="bg-fill rounded-xl px-4 py-3">
                    <p className="text-[11px] text-label2 mb-1">현재 연속 적중</p>
                    <p className="text-[22px] font-black text-label tabular-nums leading-none">
                      {predStats.currentStreak}
                      <span className="text-sm font-bold"> 연속</span>
                    </p>
                  </div>
                  <div className="bg-fill rounded-xl px-4 py-3">
                    <p className="text-[11px] text-label2 mb-1">최고 연속 적중</p>
                    <p className="text-[22px] font-black text-label tabular-nums leading-none">
                      {predStats.bestStreak}
                      <span className="text-sm font-bold"> 연속</span>
                    </p>
                  </div>
                </div>

                {/* Contextual breakdowns */}
                <div className="pt-4 border-t border-separator">
                  <p className="text-[11px] font-semibold text-label2 mb-3">상황별 적중률</p>
                  <div className="flex flex-col gap-3">
                    {predBreakdowns.myTeam && (
                      <BreakdownRow
                        label={predBreakdowns.myTeam}
                        value={predBreakdowns.myTeamAccuracy}
                      />
                    )}
                    <BreakdownRow label="직관" value={predBreakdowns.stadiumAccuracy} />
                    <BreakdownRow label="집관" value={predBreakdowns.homeAccuracy} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Watch type */}
      <section className="mb-3">
        <Card icon="📺" title="관람 방식">
          <div className="flex flex-col gap-3.5">
            {watchTypeWinRates.map(({ wt, total, winRate: wr }) => (
              <div key={wt} className="flex items-center gap-3">
                <span className="text-[13px] text-label font-semibold w-14 shrink-0">
                  {WATCH_TYPE_LABELS[wt]}
                </span>
                <div className="flex-1 h-2 bg-fill rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(total / completedLogs.length) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-label2 w-8 text-right shrink-0 tabular-nums">
                  {total}회
                </span>
                <span
                  className={`text-[11px] font-bold w-9 text-right shrink-0 tabular-nums ${
                    wr >= 50 ? "text-win" : "text-lose"
                  }`}
                >
                  {wr}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Location */}
      {topLocations.length > 0 && (
        <section className="mb-3">
          <Card icon="📍" title="자주 간 장소">
            {mostCommonLocation && (
              <div className="mb-4 pb-4 border-b border-separator">
                <p className="text-[11px] text-label2 mb-0.5">가장 많이 간 곳</p>
                <p className="text-[17px] font-bold text-label">{mostCommonLocation[0]}</p>
                <p className="text-[11px] text-label3 mt-0.5">{mostCommonLocation[1]}회 방문</p>
              </div>
            )}
            <div className="flex flex-col gap-3.5">
              {topLocations.map(([location, count], i) => (
                <div key={location} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-label3 w-4 font-semibold tabular-nums">{i + 1}</span>
                    <span className="text-[14px] text-label font-medium">{location}</span>
                  </div>
                  <span className="text-[12px] text-label2 tabular-nums">{count}회</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Player of the day */}
      {topPlayers.length > 0 && (
        <section className="mb-3">
          <Card icon="⭐" title="자주 등장한 선수">
            <div className="flex flex-col gap-3.5">
              {topPlayers.map(([player, count], i) => (
                <div key={player} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-label3 w-4 font-semibold tabular-nums">{i + 1}</span>
                    <span className="text-[14px] font-bold text-label">{player}</span>
                  </div>
                  <span className="text-[12px] text-label2 tabular-nums">{count}회</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Mood tags */}
      {topMoods.length > 0 && (
        <section className="mb-3">
          <Card icon="💭" title="자주 느낀 감정">
            <div className="flex flex-wrap gap-2">
              {topMoods.map(([tag, count]) => (
                <div
                  key={tag}
                  className="flex items-center gap-1.5 bg-primary-soft px-3.5 py-2 rounded-full"
                >
                  <span className="text-[13px] text-primary font-bold">{tag}</span>
                  <span className="text-[11px] text-primary/60 tabular-nums font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}

function AccountCard({
  user,
  onLogin,
  onLogout,
}: {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}) {
  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
    const name = (user.user_metadata?.full_name || user.user_metadata?.name) as string | undefined;
    const email = user.email;

    return (
      <div className="bg-surface rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-separator">
          <p className="text-[15px] font-bold text-label">계정</p>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="프로필"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                ⚾
              </div>
            )}
            <div>
              {name && (
                <p className="text-[14px] font-bold text-label leading-tight">{name}</p>
              )}
              <p className="text-[12px] text-label2">{email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-[12px] text-label3 font-medium px-3 py-2 rounded-xl active:bg-fill transition-colors"
          >
            <LogOut size={14} strokeWidth={1.8} />
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="px-5 py-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[14px] font-bold text-label mb-0.5">로그인하면 기록이 저장돼요</p>
          <p className="text-[12px] text-label3">어디서든 내 덕아웃 기록을 볼 수 있어요</p>
        </div>
        <button
          onClick={onLogin}
          className="shrink-0 flex items-center gap-2 bg-primary text-white text-[13px] font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-primary/20 active:scale-95 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" className="shrink-0">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" fillOpacity=".9"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" fillOpacity=".9"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white" fillOpacity=".9"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" fillOpacity=".9"/>
          </svg>
          Google 로그인
        </button>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-label font-medium">{label}</span>
      {value !== null ? (
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-fill rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-[13px] font-bold text-primary tabular-nums w-10 text-right">
            {value}%
          </span>
        </div>
      ) : (
        <span className="text-[11px] text-label3">데이터가 더 필요해요</span>
      )}
    </div>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-separator">
        <div className="flex items-center gap-2">
          <span className="text-[15px]">{icon}</span>
          <p className="text-[15px] font-bold text-label">{title}</p>
        </div>
        <ChevronRight size={16} className="text-label3" />
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
