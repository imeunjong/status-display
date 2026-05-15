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
import { Bell, BellOff, CalendarDays, LogOut, type LucideIcon } from 'lucide-react';
import TimetableSheet from '@/components/TimetableSheet';
import TodayTimeline from '@/components/TodayTimeline';

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
    if (!res.ok) {
      localStorage.removeItem('user_id');
      router.replace('/onboarding');
      return;
    }
    const json: MeResponse = await res.json();
    setMe(json.me);
    setPartner(json.partner);
  }, [router]);

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
      <div className="max-w-[440px] mx-auto px-4 pt-3 pb-3 flex flex-col min-h-[100dvh]">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-2 px-1">
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
            <button
              onClick={() => {
                localStorage.removeItem('user_id');
                router.replace('/onboarding');
              }}
              aria-label="로그아웃"
              className="flex items-center justify-center w-7 h-7 rounded-full card-flat text-ink-2 active:scale-95 transition"
            >
              <LogOut size={12} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Two cards side by side — partner is emphasized */}
        <div className="grid grid-cols-[1.15fr_1fr] gap-2.5 mb-2 items-stretch">
          <PersonCard label="상대" user={partner} />
          <PersonCard label="나" user={me} mine />
        </div>

        {/* Today's timeline */}
        <TodayTimeline onOpen={() => setTimetableOpen(true)} />

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
    <section className="mb-2">
      <h2 className="text-[11px] font-semibold text-ink-3 mb-1.5 px-1 uppercase tracking-[0.12em]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 gap-1.5">{children}</div>;
}

function Tile({
  active, Icon, label, onClick,
}: {
  active: boolean;
  Icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'h-[72px] rounded-2xl flex flex-col items-center justify-center gap-1',
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

const MOOD_TINT: Record<MoodId, { bg: string; accent: string; ring: string }> = {
  bad:        { bg: 'linear-gradient(160deg, #f4f4f6 0%, #e3e3e8 100%)', accent: '#6e6e73', ring: 'rgba(110,110,115,0.45)' },
  sad:        { bg: 'linear-gradient(160deg, #eaf3ff 0%, #c8dcf5 100%)', accent: '#3b6fb8', ring: 'rgba(59,111,184,0.45)' },
  happy:      { bg: 'linear-gradient(160deg, #fff6dc 0%, #ffe7a3 100%)', accent: '#b07a16', ring: 'rgba(176,122,22,0.45)' },
  angry:      { bg: 'linear-gradient(160deg, #ffe4e1 0%, #ffb6ad 100%)', accent: '#c33824', ring: 'rgba(195,56,36,0.5)' },
  fun:        { bg: 'linear-gradient(160deg, #ffe9f1 0%, #ffc4d8 100%)', accent: '#c43d7a', ring: 'rgba(196,61,122,0.45)' },
  dont_touch: { bg: 'linear-gradient(160deg, #2b2b2e 0%, #0e0e10 100%)', accent: '#ffffff', ring: 'rgba(255,255,255,0.25)' },
};

function PersonCard({
  label, user, mine,
}: { label: string; user: UserRow | null; mine?: boolean }) {
  if (!user) {
    return (
      <div className="card-elev rounded-3xl px-4 py-3 h-[108px] flex flex-col">
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
  const tint = !mine && user.current_mood ? MOOD_TINT[user.current_mood as MoodId] : null;
  const isDarkTint = !mine && user.current_mood === 'dont_touch';

  return (
    <div
      className={[
        'rounded-3xl px-4 py-3 h-[112px] flex flex-col relative',
        mine
          ? 'card-flat'
          : tint
          ? 'shadow-[0_10px_28px_-12px_rgba(0,0,0,0.18)]'
          : 'card-elev ring-[1.5px] ring-ink-1 shadow-[0_10px_28px_-12px_rgba(0,0,0,0.25)]',
      ].join(' ')}
      style={
        tint
          ? {
              background: tint.bg,
              boxShadow: `0 10px 28px -12px ${tint.ring}, inset 0 0 0 1.5px ${tint.ring}`,
            }
          : undefined
      }
    >
      {!mine && (
        <span
          className="absolute -top-1.5 left-3 text-[9px] font-bold tracking-[0.14em] uppercase px-1.5 py-[3px] rounded-full leading-none"
          style={
            tint
              ? { background: tint.accent, color: isDarkTint ? '#0e0e10' : '#ffffff' }
              : { background: '#1d1d1f', color: '#ffffff' }
          }
        >
          NOW
        </span>
      )}
      <div className="flex items-center justify-between mb-1">
        <p
          className={[
            'text-[10px] uppercase tracking-[0.14em] font-semibold truncate',
            isDarkTint ? 'text-white/70' : 'text-ink-3',
          ].join(' ')}
        >
          {label} · {user.nickname}
        </p>
        {score !== null && (
          <span
            className={[
              'text-[13px] font-bold tabular-nums leading-none',
              isDarkTint ? 'text-white' : 'text-ink-1',
            ].join(' ')}
          >
            {score}
            <span
              className={[
                'text-[9px] font-medium ml-0.5',
                isDarkTint ? 'text-white/50' : 'text-ink-3',
              ].join(' ')}
            >
              /100
            </span>
          </span>
        )}
      </div>

      {s && m ? (
        <>
          <div className="flex-1 flex items-center gap-2 mt-1">
            <CardIcon
              Icon={STATUS_ICON[user.current_status as StatusId]}
              label={s.label}
              dark={isDarkTint}
            />
            <CardIcon
              Icon={MOOD_ICON[user.current_mood as MoodId]}
              label={m.label}
              dark={isDarkTint}
            />
          </div>
          {updated && !mine && (
            <p
              className={[
                'text-[10px] mt-1 font-medium',
                isDarkTint ? 'text-white/55' : 'text-ink-3',
              ].join(' ')}
            >
              {timeAgo(updated)}
            </p>
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
  Icon, label, dark,
}: {
  Icon: LucideIcon;
  label: string;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col items-center min-w-0 flex-1">
      <Icon size={24} strokeWidth={1.8} className={dark ? 'text-white' : 'text-ink-1'} />
      <span
        className={[
          'text-[11px] font-semibold mt-1 truncate',
          dark ? 'text-white/85' : 'text-ink-2',
        ].join(' ')}
      >
        {label}
      </span>
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
