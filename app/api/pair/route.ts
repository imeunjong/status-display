import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 두 사람이 같은 페어 코드를 양쪽에서 입력하면 매칭된다.
// 1) 같은 코드로 먼저 들어와서 대기 중인 다른 사용자가 있으면 → 양쪽 partner_id 연결, 코드 제거
// 2) 없으면 → 내 invite_code 만 저장하고 대기 상태로 응답 ({ waiting: true })
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const userId = String(body.user_id || '');
  const code = String(body.pair_code || '').trim().toUpperCase();
  if (!userId || code.length < 4) {
    return NextResponse.json({ error: '4자 이상 입력해' }, { status: 400 });
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

  // 같은 코드로 대기 중인 다른 사용자 찾기
  const { data: candidates } = await sb
    .from('users')
    .select('*')
    .eq('invite_code', code)
    .is('partner_id', null)
    .neq('id', userId)
    .order('updated_at', { ascending: true })
    .limit(1);

  const waiting = candidates && candidates.length > 0 ? candidates[0] : null;

  if (waiting) {
    const now = new Date().toISOString();
    await sb.from('users').update({
      partner_id: waiting.id,
      invite_code: null,
      updated_at: now,
    }).eq('id', me.id);
    await sb.from('users').update({
      partner_id: me.id,
      invite_code: null,
      updated_at: now,
    }).eq('id', waiting.id);
    return NextResponse.json({ ok: true, matched: true, partner: waiting });
  }

  // 대기열에 등록
  await sb
    .from('users')
    .update({ invite_code: code, updated_at: new Date().toISOString() })
    .eq('id', me.id);
  return NextResponse.json({ ok: true, matched: false, waiting: true });
}
