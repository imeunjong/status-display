import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id');
  if (!userId) return NextResponse.json({ error: 'user_id 필요' }, { status: 400 });

  const sb = admin();
  const { data: me, error } = await sb
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!me) return NextResponse.json({ error: 'not found' }, { status: 404 });

  let partner = null;
  if (me.partner_id) {
    const { data: p } = await sb
      .from('users')
      .select('*')
      .eq('id', me.partner_id)
      .maybeSingle();
    partner = p ?? null;
  }
  return NextResponse.json({ me, partner });
}
