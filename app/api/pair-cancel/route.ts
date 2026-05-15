import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const userId = String(body.user_id || '');
  if (!userId) return NextResponse.json({ error: 'user_id 필요' }, { status: 400 });
  const sb = admin();
  await sb
    .from('users')
    .update({ invite_code: null, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .is('partner_id', null);
  return NextResponse.json({ ok: true });
}
