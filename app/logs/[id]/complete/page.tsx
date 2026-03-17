"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getLogById, saveLog } from "@/lib/storage";
import { GameLog, GameOutcome, MOOD_TAG_OPTIONS } from "@/lib/types";

const inputClass =
  "w-full bg-fill border border-separator rounded-xl px-3.5 py-3 text-sm text-label focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 placeholder:text-label3 transition-shadow";

const errorClass = "text-xs text-lose mt-1.5";

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-separator">
        <h2 className="text-[13px] font-bold text-label2 tracking-widest uppercase">{title}</h2>
      </div>
      <div className="px-5 py-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-label">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

type PostgameForm = {
  result: GameOutcome;
  playerOfTheDay: string;
  moodTags: string[];
};

type Errors = Partial<Record<keyof PostgameForm, string>>;

function validate(form: PostgameForm): Errors {
  const errors: Errors = {};
  if (!form.playerOfTheDay.trim()) errors.playerOfTheDay = "오늘의 선수를 입력해주세요.";
  if (form.moodTags.length === 0) errors.moodTags = "감정 태그를 1개 이상 선택해주세요.";
  return errors;
}

export default function CompleteLogPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [log, setLog] = useState<GameLog | null>(null);
  const [form, setForm] = useState<PostgameForm>({
    result: "win",
    playerOfTheDay: "",
    moodTags: [],
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getLogById(id).then((found) => {
      if (!found || found.status === "completed") {
        router.replace(`/logs/${id}`);
        return;
      }
      setLog(found);
    });
  }, [id, router]);

  useEffect(() => {
    if (submitted) setErrors(validate(form));
  }, [form, submitted]);

  function set<K extends keyof PostgameForm>(key: K, value: PostgameForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleMoodTag(tag: string) {
    setForm((prev) => {
      const has = prev.moodTags.includes(tag);
      if (!has && prev.moodTags.length >= 3) return prev;
      return {
        ...prev,
        moodTags: has
          ? prev.moodTags.filter((t) => t !== tag)
          : [...prev.moodTags, tag],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (!log) return;
    const now = new Date().toISOString();
    const updated: GameLog = {
      ...log,
      status: "completed",
      result: form.result,
      playerOfTheDay: form.playerOfTheDay.trim(),
      moodTags: form.moodTags,
      updatedAt: now,
    };
    await saveLog(updated);
    router.push(`/logs/${id}`);
  }

  if (!log) return null;

  const predictionCorrect = form.result === log.prediction;

  return (
    <div className="px-4 pt-6 pb-10 max-w-lg mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-7">
        <Link href={`/logs/${id}`}>
          <button className="flex items-center gap-1.5 text-primary text-sm font-semibold">
            <ArrowLeft size={18} strokeWidth={2.5} />
            뒤로
          </button>
        </Link>
        <h1 className="text-[18px] font-bold text-label">경기 후 기록</h1>
      </div>

      {/* Game summary banner */}
      <div className="bg-surface rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.05)] px-5 py-4 mb-4">
        <p className="text-[11px] text-label2 tabular-nums font-medium mb-1">{log.date} · {log.seasonYear}시즌</p>
        <h2 className="text-[17px] font-bold text-label">
          {log.myTeam}
          <span className="text-label3 font-normal text-sm mx-1.5">vs</span>
          {log.opponentTeam}
        </h2>
        <p className="text-[11px] text-label3 mt-0.5">{log.location}</p>
        <div className="mt-3 pt-3 border-t border-separator flex items-center gap-2">
          <span className="text-[11px] text-label2">예측</span>
          <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full ${
            log.prediction === "win" ? "bg-win-soft text-win" : "bg-lose-soft text-lose"
          }`}>
            {log.prediction === "win" ? "승" : "패"}
          </span>
          {predictionCorrect && (
            <span className="ml-1 text-[11px] text-win font-semibold">예측 적중!</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        {/* ── 실제 결과 ── */}
        <SectionCard title="실제 결과">
          <Field label="경기 결과" required>
            <div className="grid grid-cols-2 gap-2">
              {(["win", "lose"] as GameOutcome[]).map((o) => (
                <button
                  type="button"
                  key={o}
                  onClick={() => set("result", o)}
                  className={`py-3.5 text-sm rounded-[14px] border font-bold transition-all active:scale-[0.97] ${
                    form.result === o
                      ? o === "win"
                        ? "bg-win border-win text-white shadow-sm shadow-win/30"
                        : "bg-lose border-lose text-white shadow-sm shadow-lose/30"
                      : "bg-fill border-separator text-label2"
                  }`}
                >
                  {o === "win" ? "승" : "패"}
                </button>
              ))}
            </div>
          </Field>
        </SectionCard>

        {/* ── 오늘의 선수 ── */}
        <SectionCard title="오늘의 선수">
          <Field label="오늘의 선수" required error={errors.playerOfTheDay}>
            <input
              type="text"
              value={form.playerOfTheDay}
              onChange={(e) => set("playerOfTheDay", e.target.value)}
              placeholder="이름 입력"
              className={inputClass}
            />
          </Field>
        </SectionCard>

        {/* ── 감정 태그 ── */}
        <SectionCard title="감정 태그">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-semibold text-label">
                감정 태그<span className="text-primary ml-0.5">*</span>
              </span>
              <span className={`text-[12px] font-bold tabular-nums ${form.moodTags.length >= 3 ? "text-primary" : "text-label3"}`}>
                {form.moodTags.length}/3
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAG_OPTIONS.map((tag) => {
                const selected = form.moodTags.includes(tag);
                const disabled = !selected && form.moodTags.length >= 3;
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleMoodTag(tag)}
                    disabled={disabled}
                    className={`text-sm px-3.5 py-1.5 rounded-full border font-medium transition-all ${
                      selected
                        ? "bg-primary border-primary text-white"
                        : disabled
                        ? "bg-fill border-separator text-label3 cursor-not-allowed"
                        : "bg-fill border-separator text-label2"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            {errors.moodTags && (
              <p className={`${errorClass} mt-2`}>{errors.moodTags}</p>
            )}
          </div>
        </SectionCard>

        <button
          type="submit"
          className="w-full bg-primary active:bg-primary/90 active:scale-[0.98] text-white font-bold py-4 rounded-[16px] text-[15px] transition-all mt-1 shadow-md shadow-primary/25"
        >
          기록 완료
        </button>
      </form>
    </div>
  );
}
