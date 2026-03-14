"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { saveLog, getLogById, generateId } from "@/lib/storage";
import {
  GameLog,
  WatchType,
  GameOutcome,
  WATCH_TYPE_LABELS,
  MOOD_TAG_OPTIONS,
  KBO_TEAMS,
} from "@/lib/types";

const WATCH_TYPE_EMOJI: Record<WatchType, string> = {
  stadium: "🏟️",
  home: "📺",
  outside: "☕",
  highlights: "🎬",
};

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

type FormState = Omit<GameLog, "id" | "createdAt" | "updatedAt">;
type Errors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (!form.date) errors.date = "날짜를 선택해주세요.";
  if (!form.myTeam) errors.myTeam = "우리 팀을 선택해주세요.";
  if (!form.opponentTeam) errors.opponentTeam = "상대 팀을 선택해주세요.";
  if (!form.location.trim()) errors.location = "경기장을 입력해주세요.";
  if (!form.playerOfTheDay.trim()) errors.playerOfTheDay = "오늘의 선수를 입력해주세요.";
  if (form.moodTags.length === 0) errors.moodTags = "감정 태그를 1개 이상 선택해주세요.";
  return errors;
}

function AddLogForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = !!editId;

  const [form, setForm] = useState<FormState>({
    date: new Date().toISOString().split("T")[0],
    seasonYear: new Date().getFullYear(),
    myTeam: "",
    opponentTeam: "",
    watchType: "stadium",
    location: "",
    prediction: "win",
    result: "win",
    expectedPlayer: "",
    playerOfTheDay: "",
    moodTags: [],
  });

  const [existingLog, setExistingLog] = useState<GameLog | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (editId) {
      const log = getLogById(editId);
      if (log) {
        setExistingLog(log);
        setForm({
          date: log.date,
          seasonYear: log.seasonYear,
          myTeam: log.myTeam,
          opponentTeam: log.opponentTeam,
          watchType: log.watchType,
          location: log.location,
          prediction: log.prediction,
          result: log.result,
          expectedPlayer: log.expectedPlayer ?? "",
          playerOfTheDay: log.playerOfTheDay,
          moodTags: log.moodTags,
        });
      }
    }
  }, [editId]);

  useEffect(() => {
    if (submitted) setErrors(validate(form));
  }, [form, submitted]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const now = new Date().toISOString();
    const log: GameLog = {
      id: existingLog?.id ?? generateId(),
      ...form,
      expectedPlayer: form.expectedPlayer?.trim() || undefined,
      createdAt: existingLog?.createdAt ?? now,
      updatedAt: now,
    };
    saveLog(log);
    router.push(`/logs/${log.id}`);
  }

  return (
    <div className="px-4 pt-6 pb-10 max-w-lg mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-7">
        <Link href={isEditing ? `/logs/${editId}` : "/"}>
          <button className="flex items-center gap-1.5 text-primary text-sm font-semibold">
            <ArrowLeft size={18} strokeWidth={2.5} />
            뒤로
          </button>
        </Link>
        <h1 className="text-[18px] font-bold text-label">
          {isEditing ? "기록 수정" : "경기 기록"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        {/* ── 경기 정보 ── */}
        <SectionCard title="경기 정보">
          <Field label="날짜" required error={errors.date}>
            <input
              type="date"
              value={form.date}
              onChange={(e) => {
                const val = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  date: val,
                  seasonYear: val ? new Date(val).getFullYear() : prev.seasonYear,
                }));
              }}
              className={inputClass}
            />
          </Field>

          <Field label="우리 팀" required error={errors.myTeam}>
            <select
              value={form.myTeam}
              onChange={(e) => set("myTeam", e.target.value)}
              className={inputClass}
            >
              <option value="">팀 선택</option>
              {KBO_TEAMS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>

          <Field label="상대 팀" required error={errors.opponentTeam}>
            <select
              value={form.opponentTeam}
              onChange={(e) => set("opponentTeam", e.target.value)}
              className={inputClass}
            >
              <option value="">팀 선택</option>
              {KBO_TEAMS.filter((t) => t !== form.myTeam).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>

          <Field label="경기장" required error={errors.location}>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="예) 잠실야구장"
              className={inputClass}
            />
          </Field>
        </SectionCard>

        {/* ── 관람 방식 ── */}
        <SectionCard title="관람 방식">
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(WATCH_TYPE_LABELS) as WatchType[]).map((wt) => (
              <button
                type="button"
                key={wt}
                onClick={() => set("watchType", wt)}
                className={`py-3 text-xs rounded-[14px] border font-semibold transition-all flex flex-col items-center gap-1.5 active:scale-[0.96] ${
                  form.watchType === wt
                    ? "bg-primary border-primary text-white shadow-sm shadow-primary/30"
                    : "bg-fill border-separator text-label2"
                }`}
              >
                <span className="text-[17px]">{WATCH_TYPE_EMOJI[wt]}</span>
                <span className="text-[11px]">{WATCH_TYPE_LABELS[wt]}</span>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ── 예측 & 결과 ── */}
        <SectionCard title="예측 & 결과">
          <Field label="경기 전 예측" required>
            <div className="grid grid-cols-2 gap-2">
              {(["win", "lose"] as GameOutcome[]).map((o) => (
                <button
                  type="button"
                  key={o}
                  onClick={() => set("prediction", o)}
                  className={`py-3.5 text-sm rounded-[14px] border font-bold transition-all active:scale-[0.97] ${
                    form.prediction === o
                      ? o === "win"
                        ? "bg-win border-win text-white shadow-sm shadow-win/30"
                        : "bg-lose border-lose text-white shadow-sm shadow-lose/30"
                      : "bg-fill border-separator text-label2"
                  }`}
                >
                  {o === "win" ? "승리 예측" : "패배 예측"}
                </button>
              ))}
            </div>
          </Field>

          <Field label="실제 결과" required>
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

        {/* ── 선수 ── */}
        <SectionCard title="선수">
          <Field label="오늘의 선수" required error={errors.playerOfTheDay}>
            <input
              type="text"
              value={form.playerOfTheDay}
              onChange={(e) => set("playerOfTheDay", e.target.value)}
              placeholder="이름 입력"
              className={inputClass}
            />
          </Field>

          <Field label="기대했던 선수 (선택)">
            <input
              type="text"
              value={form.expectedPlayer}
              onChange={(e) => set("expectedPlayer", e.target.value)}
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
          {isEditing ? "수정 완료" : "기록 저장"}
        </button>
      </form>
    </div>
  );
}

export default function AddPage() {
  return (
    <Suspense>
      <AddLogForm />
    </Suspense>
  );
}
