'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!nickname.trim() || loading) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '실패');
      localStorage.setItem('user_id', json.user.id);
      router.replace('/pair');
    } catch (e) {
      setErr(e instanceof Error ? e.message : '오류');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-silver flex items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-[400px]">
        <div className="mb-10">
          <h1 className="text-[44px] font-bold tracking-iostight leading-[1.05] text-ink-1">
            안녕,
          </h1>
          <p className="text-[44px] font-bold tracking-iostight leading-[1.05] text-ink-3">
            이름이 뭐야?
          </p>
        </div>

        <div className="card-elev rounded-2xl px-5 py-4 mb-3">
          <input
            type="text"
            autoFocus
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="닉네임"
            maxLength={20}
            className="w-full bg-transparent text-[19px] font-medium outline-none text-ink-1 placeholder:text-ink-3"
          />
        </div>

        {err && <p className="text-red-500 text-[13px] mt-2 px-2">{err}</p>}

        <button
          onClick={submit}
          disabled={!nickname.trim() || loading}
          className="w-full mt-3 h-[52px] rounded-2xl bg-ink-1 text-white font-semibold text-[16px] disabled:opacity-25 active:scale-[0.98] transition shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]"
        >
          {loading ? '만드는 중' : '계속'}
        </button>

        <p className="text-ink-3 text-[12px] text-center mt-5">
          이 이름을 상대가 보게 돼
        </p>
      </div>
    </main>
  );
}
