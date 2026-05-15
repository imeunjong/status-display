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
    <main className="min-h-[100dvh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-2">상태표시</h1>
        <p className="text-neutral-400 mb-8">상대에게 보여줄 닉네임을 정해줘</p>
        <input
          type="text"
          autoFocus
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="닉네임"
          maxLength={20}
          className="w-full px-4 py-4 rounded-2xl bg-card border border-line text-lg outline-none focus:border-accent"
        />
        {err && <p className="text-red-400 text-sm mt-3">{err}</p>}
        <button
          onClick={submit}
          disabled={!nickname.trim() || loading}
          className="w-full mt-4 py-4 rounded-2xl bg-accent text-white font-semibold disabled:opacity-40"
        >
          {loading ? '만드는 중…' : '시작하기'}
        </button>
      </div>
    </main>
  );
}
