'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MeResponse } from '@/lib/types';

export default function PairPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse['me'] | null>(null);
  const [code, setCode] = useState('');
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
        if (j.me?.invite_code) {
          setCode(j.me.invite_code);
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
    if (code.length < 4 || loading) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch('/api/pair', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          user_id: localStorage.getItem('user_id'),
          pair_code: code.trim().toUpperCase(),
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
    setCode('');
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
          <p className="text-ink-3 text-[12px] uppercase tracking-[0.14em] font-semibold mb-4">
            상대를 기다리는 중
          </p>
          <div className="card-elev rounded-3xl px-6 py-10 mb-5">
            <p className="text-[44px] font-bold tracking-[0.18em] font-mono text-ink-1 leading-none">
              {code}
            </p>
          </div>
          <p className="text-ink-2 text-[14px] mb-1">
            이 코드를 상대에게 알려줘
          </p>
          <p className="text-ink-3 text-[13px]">
            상대가 같은 코드를 입력하면 자동 연결돼
          </p>
          <div className="mt-8 flex justify-center">
            <Dots />
          </div>
          <button
            onClick={cancelWait}
            className="mt-8 text-ink-3 text-[14px] font-medium active:text-ink-1"
          >
            코드 바꾸기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-silver flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-[400px]">
        <h1 className="text-[36px] font-bold tracking-iostight leading-[1.1] text-ink-1 mb-2">
          페어 코드
        </h1>
        <p className="text-ink-2 text-[15px] mb-8 leading-[1.5]">
          둘이서 정한 코드를 양쪽이 입력하면<br />자동으로 연결돼
        </p>

        <div className="card-elev rounded-2xl px-5 py-4 mb-3">
          <p className="text-ink-3 text-[11px] uppercase tracking-[0.14em] font-semibold mb-1">
            우리 코드
          </p>
          <input
            type="text"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="LOVE2026"
            maxLength={12}
            className="w-full bg-transparent text-[22px] font-bold font-mono tracking-[0.16em] outline-none text-ink-1 placeholder:text-ink-4"
          />
        </div>

        {err && <p className="text-red-500 text-[13px] mt-2 px-2">{err}</p>}

        <button
          onClick={submit}
          disabled={code.length < 4 || loading}
          className="w-full mt-3 h-[52px] rounded-2xl bg-ink-1 text-white font-semibold text-[16px] disabled:opacity-25 active:scale-[0.98] transition shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]"
        >
          {loading ? '확인 중' : '연결하기'}
        </button>

        <p className="text-ink-3 text-[12px] text-center mt-5 leading-[1.6]">
          4자 이상. 영문/숫자 가능.<br />
          예) WEDONG, LOVE2026, 0301
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
