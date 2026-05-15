'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const USERS: Record<string, string> = {
  '황구': '79a03d6e-6584-49e1-956c-738d39c2c72a',
  '젠': 'd12488aa-8b8a-4ed8-81b7-55d366319fdd',
};

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = USERS[trimmed];
    if (!id) {
      setErr('잘못된 이름이야');
      return;
    }
    localStorage.setItem('user_id', id);
    router.replace('/home');
  }

  return (
    <main className="min-h-[100dvh] bg-silver flex items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-[400px]">
        <div className="mb-10">
          <h1 className="text-[44px] font-bold tracking-iostight leading-[1.05] text-ink-1">
            너는,
          </h1>
          <p className="text-[44px] font-bold tracking-iostight leading-[1.05] text-ink-3">
            누구야?
          </p>
        </div>

        <div className="card-elev rounded-2xl px-5 py-4 mb-3">
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (err) setErr(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="이름"
            maxLength={20}
            className="w-full bg-transparent text-[19px] font-medium outline-none text-ink-1 placeholder:text-ink-3"
          />
        </div>

        {err && <p className="text-red-500 text-[13px] mt-2 px-2">{err}</p>}

        <button
          onClick={submit}
          disabled={!name.trim()}
          className="w-full mt-3 h-[52px] rounded-2xl bg-ink-1 text-white font-semibold text-[16px] disabled:opacity-25 active:scale-[0.98] transition shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]"
        >
          들어가기
        </button>
      </div>
    </main>
  );
}
