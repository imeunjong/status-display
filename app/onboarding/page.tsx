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
    <main className="min-h-[100dvh] bg-glow flex items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="mb-12">
          <h1 className="text-[40px] font-bold tracking-iostight leading-[1.1]">
            안녕,
          </h1>
          <p className="text-[40px] font-bold tracking-iostight leading-[1.1] text-ink-2">
            이름이 뭐야?
          </p>
        </div>

        <div className="glass rounded-3xl px-5 py-4 mb-3">
          <input
            type="text"
            autoFocus
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="닉네임"
            maxLength={20}
            className="w-full bg-transparent text-[19px] font-medium outline-none placeholder:text-ink-3"
          />
        </div>

        {err && (
          <p className="text-accent text-[13px] mt-2 px-2">{err}</p>
        )}

        <button
          onClick={submit}
          disabled={!nickname.trim() || loading}
          className="w-full mt-3 h-[54px] rounded-3xl bg-accent text-white font-semibold text-[17px] disabled:opacity-30 active:scale-[0.98] transition"
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
