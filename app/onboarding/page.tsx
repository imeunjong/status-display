'use client';

import { useRouter } from 'next/navigation';

const USERS = [
  { id: '79a03d6e-6584-49e1-956c-738d39c2c72a', nickname: '황구' },
  { id: 'd12488aa-8b8a-4ed8-81b7-55d366319fdd', nickname: '젠' },
];

export default function OnboardingPage() {
  const router = useRouter();

  function pick(id: string) {
    localStorage.setItem('user_id', id);
    router.replace('/home');
  }

  return (
    <main className="min-h-[100dvh] bg-silver flex items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-[400px]">
        <div className="mb-10 text-center">
          <h1 className="text-[44px] font-bold tracking-iostight leading-[1.05] text-ink-1">
            너는
          </h1>
          <p className="text-[44px] font-bold tracking-iostight leading-[1.05] text-ink-3">
            누구야?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {USERS.map((u) => (
            <button
              key={u.id}
              onClick={() => pick(u.id)}
              className="h-[120px] rounded-3xl card-elev text-ink-1 font-bold text-[32px] tracking-iostight active:scale-[0.97] transition shadow-[0_12px_28px_-14px_rgba(0,0,0,0.25)]"
            >
              {u.nickname}
            </button>
          ))}
        </div>

        <p className="text-ink-3 text-[12px] text-center mt-7">
          탭하면 바로 시작돼
        </p>
      </div>
    </main>
  );
}
