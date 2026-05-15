'use client';

import { useEffect, useState } from 'react';
import { PERIODS, DAYS, SCHEDULE, type Day } from '@/lib/timetable';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const TO_MIN = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

type Loc =
  | { day: string; state: 'off' }
  | { day: string; state: 'before' }
  | { day: string; state: 'after' }
  | { day: string; state: 'break'; afterIdx: number }
  | { day: string; state: 'in'; idx: number; progress: number };

function locate(now: Date): Loc {
  const day = DOW[now.getDay()];
  const weekday = now.getDay() >= 1 && now.getDay() <= 5;
  if (!weekday) return { day, state: 'off' };

  const m = now.getHours() * 60 + now.getMinutes();
  const starts = PERIODS.map((p) => TO_MIN(p.start));
  if (m < starts[0]) return { day, state: 'before' };
  const lastEnd = starts[starts.length - 1] + 55;
  if (m >= lastEnd) return { day, state: 'after' };

  for (let i = 0; i < PERIODS.length; i++) {
    const start = starts[i];
    const next = i < starts.length - 1 ? starts[i + 1] : start + 55;
    if (m >= start && m < next) {
      const end = start + 55;
      // 점심시간: 한 교시 (55분) 이상 떨어진 갭 안에 들어와 있을 때
      if (m >= end && next - end > 30) {
        return { day, state: 'break', afterIdx: i };
      }
      const progress = Math.min(1, (m - start) / 55);
      return { day, state: 'in', idx: i, progress };
    }
  }
  return { day, state: 'after' };
}

export default function TodayTimeline({ onOpen }: { onOpen?: () => void }) {
  const [loc, setLoc] = useState<Loc>(() => locate(new Date()));
  useEffect(() => {
    const t = setInterval(() => setLoc(locate(new Date())), 30000);
    return () => clearInterval(t);
  }, []);

  const today = (DAYS as readonly string[]).includes(loc.day) ? (loc.day as Day) : null;
  const todaySchedule = today ? SCHEDULE[today] : {};

  const currentLesson =
    loc.state === 'in' ? todaySchedule[PERIODS[loc.idx].id] ?? null : null;

  const headline = (() => {
    if (loc.state === 'off') return '주말 · 쉬는 날';
    if (loc.state === 'before') return `${loc.day} · 수업 전`;
    if (loc.state === 'after') return `${loc.day} · 수업 끝`;
    if (loc.state === 'break') return `${loc.day} · 점심시간`;
    if (loc.state === 'in') {
      const p = PERIODS[loc.idx];
      return currentLesson
        ? `${loc.day} · ${p.id}교시 · ${currentLesson.room} ${currentLesson.subject}`
        : `${loc.day} · ${p.id}교시 · 공강`;
    }
    return '';
  })();

  // 화살표 left%: 그리드 8 column 중 현재 위치
  let arrowPercent: number | null = null;
  if (loc.state === 'in') {
    arrowPercent = ((loc.idx + loc.progress) / 8) * 100;
  } else if (loc.state === 'break') {
    arrowPercent = ((loc.afterIdx + 1) / 8) * 100;
  }

  return (
    <button
      onClick={onOpen}
      className="w-full card-flat rounded-3xl px-3.5 pt-3 pb-3 mb-4 text-left active:scale-[0.995] transition"
    >
      <div className="flex items-center justify-between mb-3 px-0.5">
        <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-3">
          오늘
        </p>
        <p className="text-[12px] font-bold text-ink-1 truncate">{headline}</p>
      </div>

      {/* 8 cells with vertical red current-time line overlay */}
      <div className="relative">
        <div className="grid grid-cols-8 gap-[3px]">
          {PERIODS.map((p, i) => {
            const lesson = today ? todaySchedule[p.id] : null;
            const active = loc.state === 'in' && loc.idx === i;
            if (!lesson) {
              return (
                <div
                  key={p.id}
                  className={[
                    'h-[44px] rounded-md flex flex-col items-center justify-center',
                    active ? 'cell-free-now' : 'cell-free',
                  ].join(' ')}
                >
                  <span className="text-[9px] font-bold tabular-nums leading-none opacity-80">
                    {p.id}
                  </span>
                  <span className="text-[8px] mt-0.5 leading-none">공강</span>
                </div>
              );
            }
            const cellClass = active ? 'cell-class-now' : 'cell-class';
            return (
              <div
                key={p.id}
                className={[
                  'h-[44px] rounded-md flex flex-col items-center justify-center',
                  cellClass,
                ].join(' ')}
              >
                <span className="text-[10px] font-bold tabular-nums leading-none">
                  {lesson.room}
                </span>
                <span className="text-[8px] font-semibold mt-0.5 leading-none opacity-80">
                  {lesson.subject}
                </span>
              </div>
            );
          })}
        </div>

        {arrowPercent !== null && today && (
          <>
            <div
              className="absolute -top-1.5 -bottom-1.5 w-[2px] rounded-full bg-red-500 pointer-events-none z-10 shadow-[0_0_8px_rgba(239,68,68,0.6)] transition-[left] duration-700 ease-out"
              style={{ left: `calc(${arrowPercent}% - 1px)` }}
            />
            <div
              className="absolute -top-[7px] w-2 h-2 rounded-full bg-red-500 pointer-events-none z-10 shadow-[0_0_8px_rgba(239,68,68,0.6)] transition-[left] duration-700 ease-out"
              style={{ left: `calc(${arrowPercent}% - 4px)` }}
            />
          </>
        )}
      </div>
    </button>
  );
}
