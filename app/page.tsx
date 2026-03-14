"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, ChevronRight } from "lucide-react";
import { getLogs, seedMockData } from "@/lib/storage";
import { MOCK_LOGS } from "@/lib/mockData";
import { GameLog, WATCH_TYPE_LABELS, WatchType } from "@/lib/types";
import GameLogCard from "@/components/GameLogCard";

export default function HomePage() {
  const router = useRouter();
  const [logs, setLogs] = useState<GameLog[]>([]);

  useEffect(() => {
    seedMockData(MOCK_LOGS);
    setLogs(getLogs());
  }, []);

  const wins = logs.filter((l) => l.result === "win").length;
  const losses = logs.filter((l) => l.result === "lose").length;
  const predHits = logs.filter((l) => l.prediction === l.result).length;
  const winRate = logs.length > 0 ? Math.round((wins / logs.length) * 100) : 0;
  const predRate = logs.length > 0 ? Math.round((predHits / logs.length) * 100) : 0;

  const watchTypeCounts = logs.reduce<Partial<Record<WatchType, number>>>(
    (acc, l) => {
      acc[l.watchType] = (acc[l.watchType] || 0) + 1;
      return acc;
    },
    {}
  );
  const mostCommonWatchType = (
    Object.entries(watchTypeCounts) as [WatchType, number][]
  ).sort((a, b) => b[1] - a[1])[0]?.[0];

  const recentLogs = logs.slice(0, 3);
  const currentYear = logs.length > 0 ? logs[0].seasonYear : new Date().getFullYear();

  return (
    <div className="px-4 pt-14 pb-28">
      {/* Header */}
      <div className="mb-7">
        <p className="text-[12px] font-semibold text-primary tracking-widest uppercase mb-2">
          {currentYear} 시즌
        </p>
        <h1 className="text-[32px] font-black text-label leading-none tracking-tight">
          덕아웃 로그
        </h1>
        <p className="text-sm text-label2 mt-1.5">나만의 야구 직관 일기</p>
      </div>

      {/* Season Stats Card */}
      {logs.length > 0 && (
        <div
          className="bg-surface rounded-[20px] mb-6 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] active:scale-[0.99] transition-transform cursor-pointer"
          onClick={() => router.push("/insights")}
        >
          {/* Card header */}
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-separator">
            <div className="flex items-center gap-2">
              <span className="text-primary text-[15px]">⚾</span>
              <p className="text-[15px] font-bold text-label">이번 시즌 요약</p>
            </div>
            <ChevronRight size={16} className="text-label3" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2">
            <div className="px-5 py-5 border-r border-b border-separator">
              <p className="text-[11px] font-semibold text-label2 mb-2">총 경기</p>
              <p className="text-[40px] font-black text-label tabular-nums leading-none">
                {logs.length}
              </p>
              <p className="text-[11px] text-label3 mt-1">{wins}승 {losses}패</p>
            </div>
            <div className="px-5 py-5 border-b border-separator">
              <p className="text-[11px] font-semibold text-label2 mb-2">승률</p>
              <p className="text-[40px] font-black text-win tabular-nums leading-none">
                {winRate}
                <span className="text-[22px] font-bold">%</span>
              </p>
              <div className="mt-2 h-1.5 bg-fill rounded-full overflow-hidden">
                <div className="h-full bg-win rounded-full transition-all" style={{ width: `${winRate}%` }} />
              </div>
            </div>
            <div className="px-5 py-5 border-r border-separator">
              <p className="text-[11px] font-semibold text-label2 mb-2">예측 적중</p>
              <p className="text-[40px] font-black text-primary tabular-nums leading-none">
                {predRate}
                <span className="text-[22px] font-bold">%</span>
              </p>
            </div>
            {mostCommonWatchType && (
              <div className="px-5 py-5">
                <p className="text-[11px] font-semibold text-label2 mb-2">주요 관람</p>
                <p className="text-[28px] font-black text-label leading-none">
                  {WATCH_TYPE_LABELS[mostCommonWatchType]}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Logs */}
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-[13px] font-bold text-label tracking-tight">최근 기록</h2>
        {logs.length > 0 && (
          <Link href="/logs" className="text-[12px] text-primary font-semibold flex items-center gap-0.5">
            전체 보기 <ChevronRight size={13} strokeWidth={2.5} />
          </Link>
        )}
      </div>

      {recentLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-full bg-fill flex items-center justify-center text-2xl">
            ⚾
          </div>
          <div className="text-center">
            <p className="text-label2 text-sm font-medium">아직 기록이 없어요</p>
            <p className="text-label3 text-xs mt-1">첫 번째 경기를 기록해보세요!</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recentLogs.map((log) => (
            <GameLogCard key={log.id} log={log} />
          ))}
        </div>
      )}

      {/* FAB */}
      <div className="fixed bottom-24 right-4">
        <Link href="/add">
          <button className="flex items-center gap-2 bg-primary text-white font-bold text-sm px-5 py-3.5 rounded-full shadow-lg shadow-primary/30 active:scale-95 transition-all">
            <PlusCircle size={18} strokeWidth={2.5} />
            기록하기
          </button>
        </Link>
      </div>
    </div>
  );
}
