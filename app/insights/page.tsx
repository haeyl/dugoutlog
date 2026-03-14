"use client";

import { useEffect, useState } from "react";
import { getLogs } from "@/lib/storage";
import { GameLog, WATCH_TYPE_LABELS, WatchType } from "@/lib/types";
import { ChevronRight } from "lucide-react";

export default function InsightsPage() {
  const [logs, setLogs] = useState<GameLog[]>([]);

  useEffect(() => {
    setLogs(getLogs());
  }, []);

  if (logs.length === 0) {
    return (
      <div className="px-4 pt-12 pb-28">
        <h1 className="text-[28px] font-black text-label tracking-tight mb-1">인사이트</h1>
        <p className="text-[12px] text-label2 mb-12">시즌 통계 요약</p>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-full bg-fill flex items-center justify-center text-2xl">
            📊
          </div>
          <div className="text-center">
            <p className="text-label2 text-sm font-medium">아직 인사이트가 없어요</p>
            <p className="text-label3 text-xs mt-1">기록이 쌓이면 통계가 나타나요.</p>
          </div>
        </div>
      </div>
    );
  }

  const wins = logs.filter((l) => l.result === "win").length;
  const losses = logs.length - wins;
  const winRate = Math.round((wins / logs.length) * 100);
  const predHits = logs.filter((l) => l.prediction === l.result).length;
  const predRate = Math.round((predHits / logs.length) * 100);

  const watchTypeCounts = logs.reduce<Record<WatchType, number>>(
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
      const wtWins = logs.filter(
        (l) => l.watchType === wt && l.result === "win"
      ).length;
      return { wt, total, winRate: Math.round((wtWins / total) * 100) };
    })
    .sort((a, b) => b.total - a.total);

  const moodCounts = logs
    .flatMap((l) => l.moodTags)
    .reduce<Record<string, number>>((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
  const topMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const playerCounts = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.playerOfTheDay] = (acc[l.playerOfTheDay] || 0) + 1;
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
      <h1 className="text-[28px] font-black text-label tracking-tight mb-1">인사이트</h1>
      <p className="text-[12px] text-label2 mb-6">시즌 통계 요약</p>

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
              <p className="text-[34px] font-black text-label tabular-nums leading-none">{logs.length}</p>
              <p className="text-[11px] text-label2 mt-1.5">총 경기</p>
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

      {/* Prediction accuracy */}
      <section className="mb-3">
        <Card icon="🎯" title="예측 적중률">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[36px] font-black text-primary tabular-nums leading-none">
                {predRate}
                <span className="text-xl font-bold">%</span>
              </p>
              <p className="text-[11px] text-label2 mt-1.5">
                {predHits}번 적중 · {logs.length}경기
              </p>
            </div>
            <p className="text-[13px] text-label2 font-medium">
              {predRate >= 60
                ? "예측이 꽤 정확해요 👁"
                : predRate >= 40
                ? "반반이에요 🤔"
                : "예측이 어렵네요 😅"}
            </p>
          </div>
        </Card>
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
                    style={{ width: `${(total / logs.length) * 100}%` }}
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
