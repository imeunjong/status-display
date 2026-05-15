'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const VALID_IDS = [
  '79a03d6e-6584-49e1-956c-738d39c2c72a',
  'd12488aa-8b8a-4ed8-81b7-55d366319fdd',
];

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const id = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    router.replace(id && VALID_IDS.includes(id) ? '/home' : '/onboarding');
  }, [router]);
  return (
    <div className="min-h-[100dvh] bg-silver flex items-center justify-center text-ink-3 text-[14px]">
      불러오는 중
    </div>
  );
}
