'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const id = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    router.replace(id ? '/home' : '/onboarding');
  }, [router]);
  return (
    <div className="min-h-[100dvh] bg-silver flex items-center justify-center text-ink-3 text-[14px]">
      불러오는 중
    </div>
  );
}
