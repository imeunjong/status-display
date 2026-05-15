import { NextResponse } from 'next/server';
import { admin, makeInviteCode } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 초대 링크/코드 기반 페어링.
// 흐름:
//   1) A 가 가입하면 자동으로 pair_code 발급되어 본인 화면에 표시됨.
//   2) A 가 코드/링크를 B 에게 공유.
//   3) B 가 /join/[code] 진입 → 닉네임 입력 → 이 API 호출.
//   4) B 사용자 신규 생성 + 양쪽 partner_id 세팅.
//
// Body: { code: string, nickname: string }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = String(body.code || '').trim().toUpperCase();
  const nickname = String(body.nickname || '').trim().slice(0, 20);

  if (!code) return NextResponse.json({ error: '코드가 없어' }, { status: 400 });
  if (!nickname) return NextResponse.json({ error: '닉네임을 입력해' }, { status: 400 });

  const sb = admin();

  // 1) 초대자 조회
  const { data: inviter, error: invErr } = await sb
    .from('users')
    .select('*')
    .eq('pair_code', code)
    .maybeSingle();
  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 });
  if (!inviter) return NextResponse.json({ error: '잘못된 코드' }, { status: 404 });

  // 2) 이미 페어 된 코드면 거절
  if (inviter.partner_id) {
    return NextResponse.json({ error: '이미 연결된 코드' }, { status: 409 });
  }

  // 3) 합류자(B) 신규 생성. pair_code 충돌 회피 위해 재시도.
  let joiner: any = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    const newCode = makeInviteCode();
    const { data, error } = await sb
      .from('users')
      .insert({ nickname, pair_code: newCode })
      .select('*')
      .single();
    if (!error) {
      joiner = data;
      break;
    }
    if (!String(error.message).toLowerCase().includes('pair_code')) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  if (!joiner) return NextResponse.json({ error: '가입 실패' }, { status: 500 });

  // 4) 양쪽 partner_id 세팅
  const now = new Date().toISOString();
  await sb
    .from('users')
    .update({ partner_id: inviter.id, updated_at: now })
    .eq('id', joiner.id);
  await sb
    .from('users')
    .update({ partner_id: joiner.id, updated_at: now })
    .eq('id', inviter.id);

  return NextResponse.json({ ok: true, user: { ...joiner, partner_id: inviter.id } });
}
