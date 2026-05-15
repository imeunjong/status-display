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
    if (!code.trim() || loading) return;
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

  if (!me) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center text-neutral-500">
        불러오는 중…
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-1">상대와 연결하기</h1>
        <p className="text-neutral-400 mb-8 text-sm">
          내 코드를 상대에게 알려주거나, 상대 코드를 입력해
        </p>

        <div className="rounded-2xl bg-card border border-line p-6 mb-6 text-center">
          <p className="text-neutral-400 text-xs mb-2">내 초대코드</p>
          <p className="text-4xl font-mono font-bold tracking-[0.3em]">{me.invite_code}</p>
        </div>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="상대 초대코드"
          maxLength={6}
          className="w-full px-4 py-4 rounded-2xl bg-card border border-line text-center text-2xl font-mono tracking-[0.3em] outline-none focus:border-accent"
        />
        {err && <p className="text-red-400 text-sm mt-3">{err}</p>}
        <button
          onClick={submit}
          disabled={code.length < 6 || loading}
          className="w-full mt-4 py-4 rounded-2xl bg-accent text-white font-semibold disabled:opacity-40"
        >
          {loading ? '연결 중…' : '연결하기'}
        </button>
      </div>
    </main>
  );
}
