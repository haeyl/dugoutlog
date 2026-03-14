"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { getLogById, deleteLog } from "@/lib/storage";
import { GameLog, WATCH_TYPE_LABELS, OUTCOME_LABELS } from "@/lib/types";

export default function LogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [log, setLog] = useState<GameLog | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const found = getLogById(id);
    if (!found) {
      router.replace("/logs");
      return;
    }
    setLog(found);
  }, [id, router]);

  if (!log) return null;

  const isWin = log.result === "win";
  const predCorrect = log.prediction === log.result;

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    deleteLog(id);
    router.replace("/logs");
  }

  return (
    <div className="px-4 pt-6 pb-28">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/logs">
          <button className="flex items-center gap-1.5 text-primary text-sm font-semibold">
            <ArrowLeft size={18} strokeWidth={2.5} />
            뒤로
          </button>
        </Link>
        <div className="flex items-center gap-4">
          <Link href={`/add?edit=${log.id}`}>
            <button className="text-label3 hover:text-label2 transition-colors p-1">
              <Pencil size={18} />
            </button>
          </Link>
          <button
            onClick={handleDelete}
            className={`transition-colors p-1 ${
              confirming ? "text-lose" : "text-label3 hover:text-lose"
            }`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {confirming && (
        <div className="mb-4 bg-lose-soft border border-lose/20 rounded-2xl p-3.5 text-sm text-lose text-center font-medium">
          한 번 더 누르면 삭제됩니다
        </div>
      )}

      {/* Result hero */}
      <div
        className={`rounded-[20px] p-5 mb-3 ${
          isWin ? "bg-win-soft" : "bg-lose-soft"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] text-label2 tabular-nums font-medium">
            {log.date} · {log.seasonYear}시즌
          </p>
          <span className="text-[11px] text-label2 bg-surface px-3 py-1 rounded-full font-medium">
            {WATCH_TYPE_LABELS[log.watchType]}
          </span>
        </div>
        <h2 className="text-[18px] font-bold text-label mb-0.5">
          {log.myTeam}
          <span className="text-label3 font-normal text-sm mx-1.5">vs</span>
          {log.opponentTeam}
        </h2>
        <p className="text-[11px] text-label2 mb-5">{log.location}</p>
        <div className="flex items-center gap-3">
          <span
            className={`text-5xl font-black tracking-tight ${
              isWin ? "text-win" : "text-lose"
            }`}
          >
            {OUTCOME_LABELS[log.result]}
          </span>
          <span
            className={`text-[12px] px-3 py-1.5 rounded-full font-semibold ${
              predCorrect
                ? "bg-win text-white"
                : "bg-fill text-label2"
            }`}
          >
            예측 {predCorrect ? "적중 ✓" : "빗나감 ✗"}
          </span>
        </div>
      </div>

      {/* Detail fields */}
      <div className="bg-surface rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.05)] divide-y divide-separator mb-3 overflow-hidden">
        <Row label="예측" value={OUTCOME_LABELS[log.prediction]} />
        <Row label="오늘의 선수" value={log.playerOfTheDay} />
        {log.expectedPlayer && (
          <Row label="기대 선수" value={log.expectedPlayer} />
        )}
      </div>

      {/* Mood tags */}
      {log.moodTags.length > 0 && (
        <div className="bg-surface rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-5">
          <p className="text-[11px] font-bold text-label2 uppercase tracking-widest mb-3">
            감정 태그
          </p>
          <div className="flex flex-wrap gap-2">
            {log.moodTags.map((tag) => (
              <span
                key={tag}
                className="bg-primary-soft text-primary text-sm px-3.5 py-1.5 rounded-full font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-label3 text-center mt-8">
        {new Date(log.createdAt).toLocaleString("ko-KR")} 기록
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm text-label2">{label}</span>
      <span className="text-sm font-bold text-label">{value}</span>
    </div>
  );
}
