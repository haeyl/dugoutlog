"use client";

import { useEffect, useState } from "react";
import { getLogs } from "@/lib/storage";
import { GameLog, WatchType, WATCH_TYPE_LABELS } from "@/lib/types";
import GameLogCard from "@/components/GameLogCard";

const FILTER_OPTIONS: { label: string; value: WatchType | "all" }[] = [
  { label: "전체", value: "all" },
  { label: "직관", value: "stadium" },
  { label: "집관", value: "home" },
  { label: "외관", value: "outside" },
  { label: "하이라이트", value: "highlights" },
];

export default function LogsPage() {
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [filter, setFilter] = useState<WatchType | "all">("all");

  useEffect(() => {
    const all = getLogs();
    all.sort((a, b) => b.date.localeCompare(a.date));
    setLogs(all);
  }, []);

  const filtered =
    filter === "all" ? logs : logs.filter((l) => l.watchType === filter);

  const activeTabs = FILTER_OPTIONS.filter(
    (opt) =>
      opt.value === "all" || logs.some((l) => l.watchType === opt.value)
  );

  return (
    <div className="px-4 pt-12 pb-28">
      <div className="mb-6">
        <h1 className="text-[28px] font-black text-label tracking-tight">경기 기록</h1>
        <p className="text-[12px] text-label2 mt-1">
          {logs.length > 0 ? `총 ${logs.length}경기` : "기록을 추가해보세요"}
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-16 h-16 rounded-full bg-fill flex items-center justify-center text-2xl">
            ⚾
          </div>
          <div className="text-center">
            <p className="text-label2 text-sm font-medium">기록된 경기가 없어요</p>
            <p className="text-label3 text-xs mt-1">
              홈 화면에서 첫 기록을 추가해보세요.
            </p>
          </div>
        </div>
      ) : (
        <>
          {activeTabs.length > 1 && (
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
              {activeTabs.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
                    filter === opt.value
                      ? "bg-primary text-white"
                      : "bg-surface text-label2 border border-separator"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-label3 text-sm">
                {WATCH_TYPE_LABELS[filter as WatchType]} 기록이 없어요.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((log) => (
                <GameLogCard key={log.id} log={log} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
