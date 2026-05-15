import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = (url.searchParams.get('code') || '').trim().toUpperCase();
  if (!code) return NextResponse.json({ error: '코드 없음' }, { status: 400 });

  const sb = admin();
  const { data, error } = await sb
    .from('users')
    .select('nickname, partner_id')
    .eq('pair_code', code)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: '잘못된 코드' }, { status: 404 });
  if (data.partner_id) return NextResponse.json({ error: '이미 연결된 코드' }, { status: 409 });

  return NextResponse.json({ inviter_nickname: data.nickname });
}
