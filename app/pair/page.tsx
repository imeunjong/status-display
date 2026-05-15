'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MeResponse, UserRow } from '@/lib/types';

export default function PairPage() {
  const router = useRouter();
  const [me, setMe] = useState<UserRow | null>(null);
  const [copied, setCopied] = useState(false);
  const userIdRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    const id = userIdRef.current;
    if (!id) return;
    const r = await fetch(`/api/me?user_id=${id}`, { cache: 'no-store' });
    if (!r.ok) {
      // 유저가 사라졌으면 초기 화면으로
      localStorage.removeItem('user_id');
      router.replace('/onboarding');
      return;
    }
    const j: MeResponse = await r.json();
    if (j.me?.partner_id) {
      router.replace('/home');
      return;
    }
    setMe(j.me);
  }, [router]);

  useEffect(() => {
    const id = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    if (!id) {
      router.replace('/onboarding');
      return;
    }
    userIdRef.current = id;
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [router, load]);

  function shareLink() {
    if (!me?.pair_code) return '';
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/join/${me.pair_code}`;
  }

  async function copy() {
    const link = shareLink();
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  async function nativeShare() {
    const link = shareLink();
    if (!link) return;
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as any).share({
          title: '상태표시 페어링',
          text: `${me?.nickname} 이 너랑 연결하고 싶어`,
          url: link,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  }

  if (!me) {
    return (
      <div className="min-h-[100dvh] bg-silver flex items-center justify-center text-ink-3 text-[14px]">
        불러오는 중
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-silver flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-[400px] text-center">
        <p className="text-ink-3 text-[11px] uppercase tracking-[0.14em] font-semibold mb-3">
          상대에게 보내기
        </p>
        <h1 className="text-[28px] font-bold tracking-iostight leading-[1.15] text-ink-1 mb-2">
          이 링크를 <br />
          상대에게 보내
        </h1>
        <p className="text-ink-2 text-[14px] mb-6 leading-[1.55]">
          상대가 링크를 누르고 자기 이름을 입력하면<br />
          바로 연결돼
        </p>

        <div className="card-elev rounded-3xl px-5 py-6 mb-5">
          <p className="text-ink-3 text-[11px] uppercase tracking-[0.14em] font-semibold mb-2">
            내 코드
          </p>
          <p className="text-[36px] font-bold tracking-[0.16em] text-ink-1 tabular-nums leading-none mb-4">
            {me.pair_code}
          </p>
          <p className="text-ink-3 text-[12px] break-all leading-[1.4]">
            {shareLink()}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={nativeShare}
            className="flex-1 h-[52px] rounded-2xl bg-ink-1 text-white font-semibold text-[16px] active:scale-[0.98] transition shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]"
          >
            공유하기
          </button>
          <button
            onClick={copy}
            className="flex-1 h-[52px] rounded-2xl card-flat text-ink-1 font-semibold text-[16px] active:scale-[0.98] transition"
          >
            {copied ? '복사됨' : '링크 복사'}
          </button>
        </div>

        <p className="text-ink-3 text-[12px] mt-6 leading-[1.6]">
          상대가 연결하면 자동으로 다음 화면으로 넘어가
        </p>

        <div className="mt-4 flex justify-center">
          <Dots />
        </div>
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
