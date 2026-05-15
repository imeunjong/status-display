'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MeResponse } from '@/lib/types';

export default function PairPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse['me'] | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('user_id');
    if (!id) {
      router.replace('/onboarding');
      return;
    }
    fetch(`/api/me?user_id=${id}`)
      .then((r) => r.json())
      .then((j: MeResponse) => {
        if (j.me?.partner_id) {
          router.replace('/home');
          return;
        }
        setMe(j.me);
      });
  }, [router]);

  async function submit() {
    if (code.length < 6 || loading) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch('/api/pair', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          user_id: localStorage.getItem('user_id'),
          partner_invite_code: code.trim().toUpperCase(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '실패');
      router.replace('/home');
    } catch (e) {
      setErr(e instanceof Error ? e.message : '오류');
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    if (!me) return;
    try {
      await navigator.clipboard.writeText(me.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  if (!me) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center text-ink-3">
        불러오는 중
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-glow flex flex-col items-center justify-center px-6 py-10 animate-fade-in">
      <div className="w-full max-w-sm">
        <h1 className="text-[34px] font-bold tracking-iostight leading-[1.15] mb-2">
          상대와 연결
        </h1>
        <p className="text-ink-2 text-[15px] mb-8">
          내 코드를 알려주거나, 상대 코드를 입력해
        </p>

        <button
          onClick={copyCode}
          className="w-full glass-strong rounded-4xl px-6 py-7 mb-6 text-center active:scale-[0.99] transition"
        >
          <p className="text-ink-3 text-[11px] uppercase tracking-[0.12em] font-semibold mb-3">
            내 코드
          </p>
          <p className="text-[44px] font-bold tracking-[0.22em] font-mono leading-none">
            {me.invite_code}
          </p>
          <p className="text-ink-3 text-[12px] mt-4">
            {copied ? '복사됨' : '탭하면 복사'}
          </p>
        </button>

        <div className="glass rounded-3xl px-5 py-4 mb-3">
          <p className="text-ink-3 text-[11px] uppercase tracking-[0.12em] font-semibold mb-1">
            상대 코드 입력
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="—————"
            maxLength={6}
            className="w-full bg-transparent text-[26px] font-bold font-mono tracking-[0.22em] outline-none text-center placeholder:text-ink-4"
          />
        </div>

        {err && <p className="text-accent text-[13px] mt-2 px-2">{err}</p>}

        <button
          onClick={submit}
          disabled={code.length < 6 || loading}
          className="w-full mt-3 h-[54px] rounded-3xl bg-accent text-white font-semibold text-[17px] disabled:opacity-30 active:scale-[0.98] transition"
        >
          {loading ? '연결 중' : '연결하기'}
        </button>
      </div>
    </main>
  );
}
