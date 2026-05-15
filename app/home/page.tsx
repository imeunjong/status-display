'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  STATUSES, MOODS, STATUS_MAP, MOOD_MAP,
  StatusId, MoodId, scoreOf,
} from '@/lib/constants';
import { STATUS_ICON, MOOD_ICON } from '@/lib/icons';
import type { MeResponse, UserRow } from '@/lib/types';
import { ensurePushSubscription } from '@/lib/subscribe';
import { Bell, BellOff, CalendarDays } from 'lucide-react';
import TimetableSheet from '@/components/TimetableSheet';

export default function HomePage() {
  const router = useRouter();
  const [me, setMe] = useState<UserRow | null>(null);
  const [partner, setPartner] = useState<UserRow | null>(null);
  const [pushOn, setPushOn] = useState(false);
  const [timetableOpen, setTimetableOpen] = useState(false);
  const userIdRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    const id = userIdRef.current;
    if (!id) return;
    const res = await fetch(`/api/me?user_id=${id}`, { cache: 'no-store' });
    if (!res.ok) return;
    const json: MeResponse = await res.json();
    setMe(json.me);
    setPartner(json.partner);
  }, []);

  useEffect(() => {
    const id = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    if (!id) {
      router.replace('/onboarding');
      return;
    }
    userIdRef.current = id;
    load().then(() => {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        setPushOn(true);
      }
    });
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [router, load]);

  useEffect(() => {
    if (me && !me.partner_id) router.replace('/pair');
  }, [me, router]);

  async function pickStatus(status: StatusId) {
    if (!me) return;
    const mood = me.current_mood ?? 'happy';
    setMe({ ...me, current_status: status, current_mood: mood });
    await fetch('/api/status', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ user_id: me.id, status, mood }),
    });
  }

  async function pickMood(mood: MoodId) {
    if (!me) return;
    const status = me.current_status ?? 'home';
    setMe({ ...me, current_status: status, current_mood: mood });
    await fetch('/api/status', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ user_id: me.id, status, mood }),
    });
  }

  async function enablePush() {
    if (!me) return;
    const ok = await ensurePushSubscription(me.id);
    setPushOn(ok);
    if (!ok) alert('알림 권한이 필요해. 브라우저 설정에서 허용해줘.');
  }

  if (!me) {
    return (
      <div className="min-h-[100dvh] bg-silver flex items-center justify-center text-ink-3 text-[14px]">
        불러오는 중
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-silver animate-fade-in">
      <div className="max-w-[440px] mx-auto px-4 pt-4 pb-5 flex flex-col min-h-[100dvh]">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h1 className="text-[15px] font-bold tracking-iostight text-ink-1">상태표시</h1>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTimetableOpen(true)}
              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full card-flat text-ink-1 active:scale-95 transition"
            >
              <CalendarDays size={12} strokeWidth={2.2} />
              시간표
            </button>
            <button
              onClick={enablePush}
              className={[
                'flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition active:scale-95',
                pushOn ? 'text-ink-3' : 'text-ink-1 card-flat',
              ].join(' ')}
            >
              {pushOn ? <Bell size={12} strokeWidth={2.2} /> : <BellOff size={12} strokeWidth={2.2} />}
              {pushOn ? '켜짐' : '알림 켜기'}
            </button>
          </div>
        </div>

        {/* Two cards side by side — partner is emphasized */}
        <div className="grid grid-cols-[1fr_1.15fr] gap-2.5 mb-4 items-stretch">
          <PersonCard label="나" user={me} mine />
          <PersonCard label="상대" user={partner} />
        </div>

        {/* Status section */}
        <Section title="지금 뭐 해">
          <Grid>
            {STATUSES.map((s) => {
              const Icon = STATUS_ICON[s.id];
              return (
                <Tile
                  key={s.id}
                  active={me.current_status === s.id}
                  Icon={Icon}
                  label={s.label}
                  onClick={() => pickStatus(s.id)}
                />
              );
            })}
          </Grid>
        </Section>

        {/* Mood section */}
        <Section title="기분은 어때">
          <Grid>
            {MOODS.map((m) => {
              const Icon = MOOD_ICON[m.id];
              return (
                <Tile
                  key={m.id}
                  active={me.current_mood === m.id}
                  Icon={Icon}
                  label={m.label}
                  onClick={() => pickMood(m.id)}
                />
              );
            })}
          </Grid>
        </Section>
      </div>

      <TimetableSheet open={timetableOpen} onClose={() => setTimetableOpen(false)} />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-3">
      <h2 className="text-[11px] font-semibold text-ink-3 mb-2 px-1 uppercase tracking-[0.12em]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 gap-2">{children}</div>;
}

function Tile({
  active, Icon, label, onClick,
}: {
  active: boolean;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'h-[80px] rounded-2xl flex flex-col items-center justify-center gap-1.5',
        'transition-all duration-200 active:scale-[0.94]',
        active ? 'tile-silver-active' : 'tile-silver',
      ].join(' ')}
    >
      <Icon
        size={22}
        strokeWidth={1.8}
        className={active ? 'text-white' : 'text-ink-1'}
      />
      <span
        className={[
          'text-[12px] font-semibold',
          active ? 'text-white' : 'text-ink-1',
        ].join(' ')}
      >
        {label}
      </span>
    </button>
  );
}

function PersonCard({
  label, user, mine,
}: { label: string; user: UserRow | null; mine?: boolean }) {
  if (!user) {
    return (
      <div className="card-elev rounded-3xl px-4 py-4 h-[120px] flex flex-col">
        <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-3 mb-1">
          {label}
        </p>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-ink-3 text-[12px]">기다리는 중</p>
        </div>
      </div>
    );
  }

  const s = user.current_status ? STATUS_MAP[user.current_status] : null;
  const m = user.current_mood ? MOOD_MAP[user.current_mood] : null;
  const score = scoreOf(
    user.current_status as StatusId | null,
    user.current_mood as MoodId | null,
  );
  const updated = user.updated_at ? new Date(user.updated_at) : null;

  return (
    <div
      className={[
        'rounded-3xl px-4 py-3.5 h-[124px] flex flex-col relative',
        mine
          ? 'card-flat'
          : 'card-elev ring-[1.5px] ring-ink-1 shadow-[0_10px_28px_-12px_rgba(0,0,0,0.25)]',
      ].join(' ')}
    >
      {!mine && (
        <span className="absolute -top-1.5 left-3 text-[9px] font-bold tracking-[0.14em] uppercase bg-ink-1 text-white px-1.5 py-[3px] rounded-full leading-none">
          NOW
        </span>
      )}
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-3 truncate">
          {label} · {user.nickname}
        </p>
        {score !== null && (
          <span className="text-[13px] font-bold tabular-nums text-ink-1 leading-none">
            {score}
            <span className="text-ink-3 text-[9px] font-medium ml-0.5">/100</span>
          </span>
        )}
      </div>

      {s && m ? (
        <>
          <div className="flex-1 flex items-center gap-2 mt-1">
            <CardIcon Icon={STATUS_ICON[user.current_status as StatusId]} label={s.label} />
            <CardIcon Icon={MOOD_ICON[user.current_mood as MoodId]} label={m.label} />
          </div>
          {updated && !mine && (
            <p className="text-ink-3 text-[10px] mt-1 font-medium">{timeAgo(updated)}</p>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-ink-3 text-[12px]">아직 미정</p>
        </div>
      )}
    </div>
  );
}

function CardIcon({
  Icon, label,
}: {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center min-w-0 flex-1">
      <Icon size={24} strokeWidth={1.8} className="text-ink-1" />
      <span className="text-[11px] font-semibold text-ink-2 mt-1 truncate">{label}</span>
    </div>
  );
}

function timeAgo(d: Date): string {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return '방금';
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전`;
  return `${Math.floor(sec / 86400)}일 전`;
}
