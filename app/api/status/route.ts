import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';
import { STATUS_MAP, MOOD_MAP, StatusId, MoodId } from '@/lib/constants';
import { sendPushTo } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const userId = String(body.user_id || '');
  const status = String(body.status || '') as StatusId;
  const mood = String(body.mood || '') as MoodId;

  if (!userId || !STATUS_MAP[status] || !MOOD_MAP[mood]) {
    return NextResponse.json({ error: '잘못된 입력' }, { status: 400 });
  }

  const sb = admin();
  const { data: me, error: meErr } = await sb
    .from('users')
    .select('id, nickname, partner_id')
    .eq('id', userId)
    .maybeSingle();
  if (meErr || !me) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const now = new Date().toISOString();
  await sb
    .from('users')
    .update({ current_status: status, current_mood: mood, updated_at: now })
    .eq('id', userId);
  await sb.from('status_logs').insert({ user_id: userId, status, mood });

  if (me.partner_id) {
    const s = STATUS_MAP[status];
    const m = MOOD_MAP[mood];
    // Fire and forget — don't block the response on push delivery.
    sendPushTo(me.partner_id, {
      title: `${me.nickname}`,
      body: `${s.emoji} ${s.label} · ${m.emoji} ${m.label}`,
      url: '/home',
    }).catch((e) => console.error('push error', e));
  }

  return NextResponse.json({ ok: true });
}
