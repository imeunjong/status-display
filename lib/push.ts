import webpush, { PushSubscription as WebPushSubscription } from 'web-push';
import { admin } from './supabase';

let configured = false;
function configure() {
  if (configured) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
  if (!pub || !priv) throw new Error('VAPID keys missing');
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

export async function sendPushTo(userId: string, payload: object): Promise<void> {
  configure();
  const sb = admin();
  const { data: user, error } = await sb
    .from('users')
    .select('push_subscription')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  const sub = user?.push_subscription as WebPushSubscription | null;
  if (!sub) return;

  try {
    await webpush.sendNotification(sub, JSON.stringify(payload));
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    if (statusCode === 404 || statusCode === 410) {
      // Subscription is dead — clear it.
      await sb.from('users').update({ push_subscription: null }).eq('id', userId);
      return;
    }
    console.error('push send error', err);
  }
}
