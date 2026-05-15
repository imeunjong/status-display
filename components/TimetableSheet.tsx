'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { PERIODS, DAYS, SCHEDULE, TIMETABLE_OWNER, TIMETABLE_UPDATED } from '@/lib/timetable';

export default function TimetableSheet({
  open, onClose,
}: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const now = new Date();
  const today = now.getDay(); // 0=Sun..6=Sat
  const todayIdx = today >= 1 && today <= 5 ? today - 1 : -1;

  // 빨간 가로선: 현재 시각이 어느 위치인지
  const ROW_H = 46;
  const ROW_GAP = 4;
  const ROW_PITCH = ROW_H + ROW_GAP;
  const toMin = (s: string) => {
    const [h, m] = s.split(':').map(Number);
    return h * 60 + m;
  };
  const minutes = now.getHours() * 60 + now.getMinutes();
  const starts = PERIODS.map((p) => toMin(p.start));
  let nowY: number | null = null;
  if (todayIdx !== -1 && minutes >= starts[0]) {
    const lastEnd = starts[starts.length - 1] + 55;
    if (minutes < lastEnd) {
      for (let i = 0; i < PERIODS.length; i++) {
        const start = starts[i];
        const next = i < starts.length - 1 ? starts[i + 1] : start + 55;
        if (minutes >= start && minutes < next) {
          const progress = Math.min(1, (minutes - start) / 55);
          nowY = i * ROW_PITCH + progress * ROW_H;
          break;
        }
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-[520px] max-h-[92dvh] overflow-hidden bg-white rounded-t-[28px] sm:rounded-[28px] shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.25)] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <span className="w-9 h-1 rounded-full bg-ink-4" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-3">
              시간표
            </p>
            <h2 className="text-[18px] font-bold tracking-iostight text-ink-1 mt-0.5 truncate">
              {TIMETABLE_OWNER}의 한 주
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center active:scale-95 transition shrink-0"
          >
            <X size={16} strokeWidth={2} className="text-ink-1" />
          </button>
        </div>

        {/* Grid */}
        <div className="px-2.5 pb-3 overflow-y-auto" style={{ maxHeight: 'calc(92dvh - 110px)' }}>
          {/* Header row — separate grid for clean alignment */}
          <div
            className="grid gap-1 mb-1"
            style={{ gridTemplateColumns: '32px repeat(5, minmax(0, 1fr))' }}
          >
            <div />
            {DAYS.map((d, i) => (
              <div key={d} className="text-center min-w-0">
                <span
                  className={[
                    'inline-flex items-center justify-center text-[11px] font-bold rounded-md px-2 py-1.5 min-w-[24px]',
                    todayIdx === i
                      ? 'bg-ink-1 text-white'
                      : 'text-ink-2',
                  ].join(' ')}
                >
                  {d}
                </span>
              </div>
            ))}
          </div>

          {/* Period rows with horizontal red current-time line */}
          <div className="relative">
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: '32px repeat(5, minmax(0, 1fr))' }}
            >
              {PERIODS.map((p) => (
                <PeriodRow key={p.id} period={p} todayIdx={todayIdx} />
              ))}
            </div>
            {nowY !== null && (
              <div
                className="absolute pointer-events-none z-10 transition-[top] duration-700 ease-out"
                style={{ top: `${nowY}px`, left: '32px', right: 0 }}
              >
                <div className="relative h-[2px] bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.55)]">
                  <span className="absolute -left-2 -top-[5px] w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]" />
                  <span className="absolute -top-[18px] right-1 text-[10px] font-bold text-red-500 bg-white px-1.5 py-0.5 rounded-md shadow-sm tabular-nums">
                    {now.getHours().toString().padStart(2, '0')}:
                    {now.getMinutes().toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <p className="text-[10px] text-ink-3 text-center mt-3 font-medium">
            업데이트 {TIMETABLE_UPDATED}
          </p>
        </div>
      </div>
    </div>
  );
}

function PeriodRow({
  period, todayIdx,
}: { period: { id: number; start: string }; todayIdx: number }) {
  return (
    <>
      <div className="flex flex-col items-center justify-center py-1 min-w-0">
        <span className="text-[11px] font-bold text-ink-1 tabular-nums leading-none">
          {period.id}
        </span>
        <span className="text-[8px] text-ink-3 tabular-nums mt-0.5 leading-none">
          {period.start}
        </span>
      </div>
      {DAYS.map((d, i) => {
        const lesson = SCHEDULE[d][period.id];
        const isToday = todayIdx === i;
        if (!lesson) {
          return (
            <div
              key={d}
              className={[
                'h-[46px] rounded-md min-w-0',
                isToday ? 'cell-free-now' : 'cell-free',
              ].join(' ')}
            />
          );
        }
        // 정보 셀도 일반 수업과 같은 색
        const cellClass = isToday ? 'cell-class-now' : 'cell-class';
        return (
          <div
            key={d}
            className={[
              'h-[46px] rounded-md flex flex-col items-center justify-center min-w-0 px-0.5',
              cellClass,
            ].join(' ')}
          >
            <span className="text-[11px] font-bold tabular-nums leading-none">
              {lesson.room}
            </span>
            <span className="text-[9px] font-semibold mt-0.5 leading-none truncate w-full text-center opacity-80">
              {lesson.subject}
            </span>
          </div>
        );
      })}
    </>
  );
}
