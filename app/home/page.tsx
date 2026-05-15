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
      // After first load, if paired but no push yet, prompt.
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
      <div className="min-h-[100dvh] flex items-center justify-center text-neutral-500">
        불러오는 중…
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] px-4 py-6 max-w-md mx-auto">
      <PartnerCard partner={partner} />

      {!pushOn && (
        <button
          onClick={enablePush}
          className="w-full mb-4 py-3 rounded-xl bg-card border border-line text-sm text-neutral-300"
        >
          🔔 푸시 알림 켜기
        </button>
      )}

      <section className="mb-6">
        <h2 className="text-sm text-neutral-400 mb-3 px-1">지금 내 상태</h2>
        <div className="grid grid-cols-3 gap-3">
          {STATUSES.map((s) => {
            const active = me.current_status === s.id;
            return (
              <button
                key={s.id}
                onClick={() => pickStatus(s.id)}
                className={`aspect-square rounded-2xl border flex flex-col items-center justify-center gap-1 transition active:scale-95 ${
                  active
                    ? 'bg-accent border-accent text-white'
                    : 'bg-card border-line text-neutral-100'
                }`}
              >
                <span className="text-3xl">{s.emoji}</span>
                <span className="text-sm font-medium">{s.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm text-neutral-400 mb-3 px-1">기분</h2>
        <div className="grid grid-cols-3 gap-3">
          {MOODS.map((m) => {
            const active = me.current_mood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => pickMood(m.id)}
                className={`aspect-square rounded-2xl border flex flex-col items-center justify-center gap-1 transition active:scale-95 ${
                  active
                    ? 'bg-accent border-accent text-white'
                    : 'bg-card border-line text-neutral-100'
                }`}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-sm font-medium">{m.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <p className="text-center text-xs text-neutral-600 mt-10">
        내 코드: <span className="font-mono">{me.invite_code}</span>
      </p>
    </main>
  );
}

function PartnerCard({ partner }: { partner: UserRow | null }) {
  if (!partner) {
    return (
      <div className="rounded-2xl bg-card border border-line p-5 mb-6 text-center text-neutral-500">
        아직 연결된 상대가 없어
      </div>
    );
  }
  const s = partner.current_status ? STATUS_MAP[partner.current_status] : null;
  const m = partner.current_mood ? MOOD_MAP[partner.current_mood] : null;
  const updated = partner.updated_at ? new Date(partner.updated_at) : null;

  return (
    <div className="rounded-2xl bg-card border border-line p-5 mb-6">
      <p className="text-xs text-neutral-500 mb-1">{partner.nickname}</p>
      {s && m ? (
        <>
          <p className="text-3xl font-semibold">
            {s.emoji} {s.label}
            <span className="text-neutral-500 mx-2">·</span>
            {m.emoji} {m.label}
          </p>
          {updated && (
            <p className="text-xs text-neutral-600 mt-2">{timeAgo(updated)}</p>
          )}
        </>
      ) : (
        <p className="text-lg text-neutral-500">아직 상태를 안 정했어</p>
      )}
    </div>
  );
}

function timeAgo(d: Date): string {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return '방금 전';
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전`;
  return `${Math.floor(sec / 86400)}일 전`;
}
