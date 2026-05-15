import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const userId = String(body.user_id || '');
  const code = String(body.partner_invite_code || '').trim().toUpperCase();
  if (!userId || !code) {
    return NextResponse.json({ error: 'user_id, partner_invite_code 필요' }, { status: 400 });
  }

  const sb = admin();

  const { data: me, error: meErr } = await sb
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (meErr || !me) return NextResponse.json({ error: '내 정보 없음' }, { status: 404 });

  if (me.invite_code === code) {
    return NextResponse.json({ error: '본인 코드로는 페어링 안 돼' }, { status: 400 });
  }

  const { data: partner } = await sb
    .from('users')
    .select('*')
    .eq('invite_code', code)
    .maybeSingle();
  if (!partner) return NextResponse.json({ error: '그런 코드는 없어' }, { status: 404 });

  if (partner.partner_id && partner.partner_id !== me.id) {
    return NextResponse.json({ error: '상대가 이미 다른 사람과 연결됨' }, { status: 409 });
  }

  await sb.from('users').update({ partner_id: partner.id, updated_at: new Date().toISOString() }).eq('id', me.id);
  await sb.from('users').update({ partner_id: me.id, updated_at: new Date().toISOString() }).eq('id', partner.id);

  return NextResponse.json({ ok: true, partner });
}
