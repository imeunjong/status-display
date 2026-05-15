import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const userId = String(body.user_id || '');
  const subscription = body.subscription;
  if (!userId || !subscription) {
    return NextResponse.json({ error: 'user_id, subscription 필요' }, { status: 400 });
  }
  const sb = admin();
  const { error } = await sb
    .from('users')
    .update({ push_subscription: subscription, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
