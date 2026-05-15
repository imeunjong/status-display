'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MeResponse } from '@/lib/types';

export default function PairPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse['me'] | null>(null);
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const userIdRef = useRef<string | null>(null);

  const checkMatched = useCallback(async () => {
    const id = userIdRef.current;
    if (!id) return;
    const r = await fetch(`/api/me?user_id=${id}`, { cache: 'no-store' });
    if (!r.ok) return;
    const j: MeResponse = await r.json();
    if (j.me?.partner_id) {
      router.replace('/home');
    }
  }, [router]);

  useEffect(() => {
    const id = localStorage.getItem('user_id');
    if (!id) {
      router.replace('/onboarding');
      return;
    }
    userIdRef.current = id;
    fetch(`/api/me?user_id=${id}`)
      .then((r) => r.json())
      .then((j: MeResponse) => {
        if (j.me?.partner_id) {
          router.replace('/home');
          return;
        }
        setMe(j.me);
        if (j.me?.partner_nickname) {
          setTarget(j.me.partner_nickname);
          setWaiting(true);
        }
      });
  }, [router]);

  useEffect(() => {
    if (!waiting) return;
    const t = setInterval(checkMatched, 3000);
    return () => clearInterval(t);
  }, [waiting, checkMatched]);

  async function submit() {
    if (!target.trim() || loading) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch('/api/pair', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          user_id: localStorage.getItem('user_id'),
          partner_nickname: target.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '실패');
      if (json.matched) {
        router.replace('/home');
      } else {
        setWaiting(true);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : '오류');
    } finally {
      setLoading(false);
    }
  }

  async function cancelWait() {
    setWaiting(false);
    setTarget('');
    const id = userIdRef.current;
    if (!id) return;
    await fetch('/api/pair-cancel', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ user_id: id }),
    });
  }

  if (!me) {
    return (
      <div className="min-h-[100dvh] bg-silver flex items-center justify-center text-ink-3">
        불러오는 중
      </div>
    );
  }

  if (waiting) {
    return (
      <main className="min-h-[100dvh] bg-silver flex flex-col items-center justify-center px-6 animate-fade-in">
        <div className="w-full max-w-[400px] text-center">
          <p className="text-ink-3 text-[11px] uppercase tracking-[0.14em] font-semibold mb-4">
            기다리는 중
          </p>
          <div className="card-elev rounded-3xl px-6 py-8 mb-5">
            <p className="text-[28px] font-bold text-ink-3 tracking-iostight leading-none mb-2">
              {me.nickname}
            </p>
            <p className="text-[12px] text-ink-3 mb-2">↓</p>
            <p className="text-[28px] font-bold text-ink-1 tracking-iostight leading-none">
              {target}
            </p>
          </div>
          <p className="text-ink-2 text-[14px] mb-1">
            <b>{target}</b> 도 <b>{me.nickname}</b> 을(를) 입력하면 연결돼
          </p>
          <p className="text-ink-3 text-[12px] mt-1">
            자동으로 확인 중
          </p>
          <div className="mt-7 flex justify-center">
            <Dots />
          </div>
          <button
            onClick={cancelWait}
            className="mt-7 text-ink-3 text-[14px] font-medium active:text-ink-1"
          >
            상대 이름 바꾸기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-silver flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-[400px]">
        <h1 className="text-[36px] font-bold tracking-iostight leading-[1.1] text-ink-1 mb-2">
          상대는 누구야?
        </h1>
        <p className="text-ink-2 text-[15px] mb-7 leading-[1.5]">
          상대의 이름을 입력해.<br />
          상대도 너의 이름 <b className="text-ink-1">{me.nickname}</b> 을(를) 입력하면 연결돼.
        </p>

        <div className="card-elev rounded-2xl px-5 py-4 mb-3">
          <p className="text-ink-3 text-[11px] uppercase tracking-[0.14em] font-semibold mb-1">
            상대 이름
          </p>
          <input
            type="text"
            autoFocus
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="예) 황구"
            maxLength={20}
            className="w-full bg-transparent text-[20px] font-bold outline-none text-ink-1 placeholder:text-ink-3"
          />
        </div>

        {err && <p className="text-red-500 text-[13px] mt-2 px-2">{err}</p>}

        <button
          onClick={submit}
          disabled={!target.trim() || loading}
          className="w-full mt-3 h-[52px] rounded-2xl bg-ink-1 text-white font-semibold text-[16px] disabled:opacity-25 active:scale-[0.98] transition shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]"
        >
          {loading ? '확인 중' : '연결하기'}
        </button>

        <p className="text-ink-3 text-[12px] text-center mt-5 leading-[1.6]">
          정확한 닉네임이어야 매칭돼
        </p>
      </div>
    </main>
  );
}

function Dots() {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-ink-3 animate-pulse"
          style={{ animationDelay: `${i * 180}ms`, animationDuration: '1.2s' }}
        />
      ))}
    </div>
  );
}
