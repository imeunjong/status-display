import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 양쪽이 서로의 닉네임을 입력하면 매칭된다.
// - A 가 "황구" 입력하면, nickname='황구' 인 사용자 B 를 찾는다.
// - B 가 partner_nickname='젠' (= A 의 nickname) 이면 양쪽 매칭.
// - 그렇지 않으면 A.partner_nickname='황구' 저장하고 대기.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const userId = String(body.user_id || '');
  const target = String(body.partner_nickname || '').trim();
  if (!userId || !target) {
    return NextResponse.json({ error: '상대 이름을 입력해' }, { status: 400 });
  }

  const sb = admin();

  const { data: me, error: meErr } = await sb
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (meErr || !me) return NextResponse.json({ error: '내 정보 없음' }, { status: 404 });

  if (me.partner_id) {
    return NextResponse.json({ ok: true, matched: true });
  }

  if (target === me.nickname) {
    return NextResponse.json({ error: '본인 이름은 안 돼' }, { status: 400 });
  }

  // 상대 닉네임을 가진 사용자 후보 — 본인을 상대로 지정해 둔(=서로 부른) 사람 우선
  const { data: candidates } = await sb
    .from('users')
    .select('*')
    .eq('nickname', target)
    .is('partner_id', null);

  const mutual = (candidates || []).find((c) => c.partner_nickname === me.nickname);

  if (mutual) {
    const now = new Date().toISOString();
    await sb.from('users').update({
      partner_id: mutual.id,
      partner_nickname: null,
      updated_at: now,
    }).eq('id', me.id);
    await sb.from('users').update({
      partner_id: me.id,
      partner_nickname: null,
      updated_at: now,
    }).eq('id', mutual.id);
    return NextResponse.json({ ok: true, matched: true, partner: mutual });
  }

  // 대기 등록
  await sb
    .from('users')
    .update({ partner_nickname: target, updated_at: new Date().toISOString() })
    .eq('id', me.id);
  return NextResponse.json({ ok: true, matched: false, waiting: true });
}
