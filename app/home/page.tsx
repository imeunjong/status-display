'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { STATUSES, MOODS, STATUS_MAP, MOOD_MAP, StatusId, MoodId } from '@/lib/constants';
import type { MeResponse, UserRow } from '@/lib/types';
import { ensurePushSubscription } from '@/lib/subscribe';

export default function HomePage() {
  const router = useRouter();
  const [me, setMe] = useState<UserRow | null>(null);
  const [partner, setPartner] = useState<UserRow | null>(null);
  const [pushOn, setPushOn] = useState(false);
  const [tick, setTick] = useState(0);
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
    const t2 = setInterval(() => setTick((n) => n + 1), 30000);
    return () => {
      clearInterval(t);
      clearInterval(t2);
    };
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
      <div className="min-h-[100dvh] flex items-center justify-center text-ink-3 text-[15px]">
        불러오는 중
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-glow animate-fade-in">
      <div className="max-w-md mx-auto px-5 pt-8 pb-12">
        <PartnerCard partner={partner} tick={tick} />

        {!pushOn && (
          <button
            onClick={enablePush}
            className="w-full mb-6 h-[44px] glass rounded-2xl text-[14px] text-ink-2 font-medium active:scale-[0.99] transition"
          >
            알림 켜기
          </button>
        )}

        <Section title="지금 뭐 해">
          <Grid>
            {STATUSES.map((s) => (
              <Tile
                key={s.id}
                active={me.current_status === s.id}
                emoji={s.emoji}
                label={s.label}
                onClick={() => pickStatus(s.id)}
              />
            ))}
          </Grid>
        </Section>

        <Section title="기분은 어때">
          <Grid>
            {MOODS.map((m) => (
              <Tile
                key={m.id}
                active={me.current_mood === m.id}
                emoji={m.emoji}
                label={m.label}
                onClick={() => pickMood(m.id)}
              />
            ))}
          </Grid>
        </Section>

        <p className="text-center text-ink-3 text-[11px] mt-10 tracking-[0.06em]">
          내 코드 · <span className="font-mono font-semibold">{me.invite_code}</span>
        </p>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="text-[13px] font-semibold text-ink-2 mb-3 px-1">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 gap-2.5">{children}</div>;
}

function Tile({
  active,
  emoji,
  label,
  onClick,
}: {
  active: boolean;
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'aspect-square rounded-[26px] flex flex-col items-center justify-center gap-1.5',
        'transition-all duration-200 active:scale-[0.94]',
        active
          ? 'bg-accent-soft ring-[1.5px] ring-accent shadow-[0_8px_28px_-10px_rgba(255,55,95,0.55)]'
          : 'glass',
      ].join(' ')}
    >
      <span className="text-[34px] leading-none">{emoji}</span>
      <span
        className={[
          'text-[13px] font-semibold',
          active ? 'text-white' : 'text-ink-2',
        ].join(' ')}
      >
        {label}
      </span>
    </button>
  );
}

function PartnerCard({ partner, tick: _ }: { partner: UserRow | null; tick: number }) {
  if (!partner) {
    return (
      <div className="glass rounded-4xl px-6 py-8 mb-6 text-center">
        <p className="text-ink-3 text-[14px]">아직 연결된 상대가 없어</p>
      </div>
    );
  }
  const s = partner.current_status ? STATUS_MAP[partner.current_status] : null;
  const m = partner.current_mood ? MOOD_MAP[partner.current_mood] : null;
  const updated = partner.updated_at ? new Date(partner.updated_at) : null;

  return (
    <div className="glass-strong rounded-4xl px-6 py-7 mb-6 relative overflow-hidden">
      <p className="text-ink-3 text-[12px] font-semibold tracking-[0.08em] uppercase mb-3">
        {partner.nickname}
      </p>
      {s && m ? (
        <>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex flex-col items-center min-w-0">
              <span className="text-[44px] leading-none">{s.emoji}</span>
              <span className="text-[13px] font-semibold text-ink-2 mt-2">{s.label}</span>
            </div>
            <span className="text-ink-4 text-[22px] font-thin">·</span>
            <div className="flex flex-col items-center min-w-0">
              <span className="text-[44px] leading-none">{m.emoji}</span>
              <span className="text-[13px] font-semibold text-ink-2 mt-2">{m.label}</span>
            </div>
          </div>
          {updated && (
            <p className="text-ink-3 text-[11px] mt-3 font-medium">{timeAgo(updated)}</p>
          )}
        </>
      ) : (
        <p className="text-[18px] text-ink-2 font-medium">아직 정하지 않았어</p>
      )}
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
