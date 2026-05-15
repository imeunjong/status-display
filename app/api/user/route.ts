import { NextResponse } from 'next/server';
import { admin, makeInviteCode } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const nickname = String(body.nickname || '').trim().slice(0, 20);
  if (!nickname) {
    return NextResponse.json({ error: '닉네임을 입력해' }, { status: 400 });
  }

  const sb = admin();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeInviteCode();
    const { data, error } = await sb
      .from('users')
      .insert({ nickname, invite_code: code })
      .select('*')
      .single();
    if (!error) return NextResponse.json({ user: data });
    // Code collision → retry. Otherwise bail.
    if (!String(error.message).includes('invite_code')) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  return NextResponse.json({ error: '초대코드 생성 실패' }, { status: 500 });
}
