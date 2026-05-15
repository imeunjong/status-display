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

  const today = new Date().getDay(); // 0=Sun..6=Sat
  const todayIdx = today >= 1 && today <= 5 ? today - 1 : -1;

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
        <div className="flex items-center justify-between px-5 pt-3 pb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-3">
              시간표
            </p>
            <h2 className="text-[22px] font-bold tracking-iostight text-ink-1 mt-0.5">
              {TIMETABLE_OWNER}의 한 주
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center active:scale-95 transition"
          >
            <X size={18} strokeWidth={2} className="text-ink-1" />
          </button>
        </div>

        {/* Grid */}
        <div className="px-3 pb-3 overflow-y-auto" style={{ maxHeight: 'calc(92dvh - 130px)' }}>
          <div className="grid grid-cols-[44px_repeat(5,1fr)] gap-1">
            {/* Header row */}
            <div />
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={[
                  'text-center text-[12px] font-bold py-2 rounded-lg',
                  todayIdx === i ? 'bg-ink-1 text-white' : 'text-ink-2',
                ].join(' ')}
              >
                {d}
              </div>
            ))}

            {/* Period rows */}
            {PERIODS.map((p) => (
              <PeriodRow key={p.id} period={p} todayIdx={todayIdx} />
            ))}
          </div>

          <p className="text-[11px] text-ink-3 text-center mt-4 font-medium">
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
      <div className="flex flex-col items-center justify-center py-2">
        <span className="text-[13px] font-bold text-ink-1 tabular-nums">{period.id}</span>
        <span className="text-[9px] text-ink-3 tabular-nums mt-0.5">{period.start}</span>
      </div>
      {DAYS.map((d, i) => {
        const lesson = SCHEDULE[d][period.id];
        const isToday = todayIdx === i;
        if (!lesson) {
          return (
            <div
              key={d}
              className={[
                'h-[50px] rounded-lg',
                isToday ? 'bg-surface-2' : 'bg-surface-1',
                'border border-line',
              ].join(' ')}
            />
          );
        }
        return (
          <div
            key={d}
            className={[
              'h-[50px] rounded-lg flex flex-col items-center justify-center',
              lesson.accent
                ? 'bg-ink-1 text-white'
                : isToday
                ? 'bg-white border border-ink-1/30'
                : 'card-flat',
            ].join(' ')}
          >
            <span
              className={[
                'text-[12px] font-bold tabular-nums leading-none',
                lesson.accent ? 'text-white' : 'text-ink-1',
              ].join(' ')}
            >
              {lesson.room}
            </span>
            <span
              className={[
                'text-[10px] font-semibold mt-1 leading-none',
                lesson.accent ? 'text-white/80' : 'text-ink-2',
              ].join(' ')}
            >
              {lesson.subject}
            </span>
          </div>
        );
      })}
    </>
  );
}
