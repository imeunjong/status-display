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
          <div className="grid grid-cols-[28px_repeat(5,minmax(0,1fr))] gap-1">
            {/* Header row */}
            <div />
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={[
                  'text-center text-[11px] font-bold py-1.5 rounded-md min-w-0',
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
                isToday ? 'bg-surface-2' : 'bg-surface-1',
                'border border-dashed border-ink-4',
              ].join(' ')}
            />
          );
        }
        return (
          <div
            key={d}
            className={[
              'h-[46px] rounded-md flex flex-col items-center justify-center min-w-0 px-0.5',
              lesson.accent
                ? 'bg-ink-1 text-white'
                : isToday
                ? 'bg-white border-[1.5px] border-ink-1'
                : 'card-flat',
            ].join(' ')}
          >
            <span
              className={[
                'text-[11px] font-bold tabular-nums leading-none',
                lesson.accent ? 'text-white' : 'text-ink-1',
              ].join(' ')}
            >
              {lesson.room}
            </span>
            <span
              className={[
                'text-[9px] font-semibold mt-0.5 leading-none truncate w-full text-center',
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
