import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const nickname = String(body.nickname || '').trim().slice(0, 20);
  if (!nickname) {
    return NextResponse.json({ error: '닉네임을 입력해' }, { status: 400 });
  }

  const sb = admin();
  const { data, error } = await sb
    .from('users')
    .insert({ nickname })
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}
