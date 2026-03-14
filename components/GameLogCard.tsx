"use client";

import Link from "next/link";
import { GameLog, WATCH_TYPE_LABELS } from "@/lib/types";

interface Props {
  log: GameLog;
}

export default function GameLogCard({ log }: Props) {
  const isWin = log.result === "win";

  return (
    <Link href={`/logs/${log.id}`}>
      <div className="bg-surface rounded-[20px] overflow-hidden flex active:scale-[0.98] transition-transform shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        {/* Left accent bar */}
        <div className={`w-1 shrink-0 ${isWin ? "bg-win" : "bg-lose"}`} />

        <div className="flex-1 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-label2 mb-1.5 tabular-nums font-medium">
                {log.date}
                <span className="mx-1.5 text-label3">·</span>
                {WATCH_TYPE_LABELS[log.watchType]}
              </p>
              <h3 className="font-bold text-label text-[15px] leading-snug truncate">
                {log.myTeam}
                <span className="text-label3 font-normal text-sm mx-1.5">vs</span>
                {log.opponentTeam}
              </h3>
              <p className="text-[11px] text-label3 mt-0.5 truncate">{log.location}</p>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-label3 font-medium">예측</span>
                <span className={`font-black w-7 h-7 flex items-center justify-center rounded-full text-[12px] ${
                  log.prediction === "win" ? "bg-win-soft text-win" : "bg-lose-soft text-lose"
                }`}>
                  {log.prediction === "win" ? "승" : "패"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-label3 font-medium">실제</span>
                <span className={`font-black w-7 h-7 flex items-center justify-center rounded-full text-[12px] ${
                  isWin ? "bg-win text-white" : "bg-lose text-white"
                }`}>
                  {isWin ? "승" : "패"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-separator flex items-center gap-1.5">
            <span className="text-[11px] text-label2">오늘의 선수</span>
            <span className="text-[12px] font-semibold text-label">{log.playerOfTheDay}</span>
          </div>

          {log.moodTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {log.moodTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] bg-primary-soft text-primary px-2.5 py-0.5 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
