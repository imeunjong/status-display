'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const code = (params.code || '').toUpperCase();
  const [nickname, setNickname] = useState('');
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // 이미 가입된 사용자가 잘못 들어왔으면 안내
    const existing = localStorage.getItem('user_id');
    if (existing) {
      // 그냥 메인으로 보내자
      router.replace('/');
      return;
    }
    // 코드 유효성 가볍게 확인
    fetch(`/api/join-info?code=${encodeURIComponent(code)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        if (j.inviter_nickname) {
          setInviterName(j.inviter_nickname);
        } else {
          setErr(j.error || '잘못된 코드');
        }
      })
      .catch(() => setErr('코드 확인 실패'))
      .finally(() => setChecking(false));
  }, [code, router]);

  async function submit() {
    if (!nickname.trim() || loading) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch('/api/pair', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code, nickname: nickname.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '실패');
      localStorage.setItem('user_id', json.user.id);
      router.replace('/home');
    } catch (e) {
      setErr(e instanceof Error ? e.message : '오류');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-[100dvh] bg-silver flex items-center justify-center text-ink-3 text-[14px]">
        확인하는 중
      </div>
    );
  }

  if (err && !inviterName) {
    return (
      <main className="min-h-[100dvh] bg-silver flex items-center justify-center px-6 animate-fade-in">
        <div className="w-full max-w-[400px] text-center">
          <h1 className="text-[28px] font-bold tracking-iostight text-ink-1 mb-3">
            {err}
          </h1>
          <p className="text-ink-2 text-[14px] mb-7">
            링크가 만료됐거나 잘못됐어
          </p>
          <button
            onClick={() => router.replace('/onboarding')}
            className="w-full h-[52px] rounded-2xl bg-ink-1 text-white font-semibold text-[16px] active:scale-[0.98] transition"
          >
            처음부터 시작
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-silver flex items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-[400px]">
        <p className="text-ink-3 text-[11px] uppercase tracking-[0.14em] font-semibold mb-3">
          초대 받음
        </p>
        <h1 className="text-[32px] font-bold tracking-iostight leading-[1.15] text-ink-1 mb-2">
          <span className="text-ink-1">{inviterName}</span> 이<br />
          너랑 연결하고 싶어해
        </h1>
        <p className="text-ink-2 text-[14px] mb-7 leading-[1.55]">
          네 이름이 뭐야?
        </p>

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
          {loading ? '연결 중' : '연결하기'}
        </button>

        <p className="text-ink-3 text-[12px] text-center mt-5">
          이 이름을 {inviterName} 이 보게 돼
        </p>
      </div>
    </main>
  );
}
