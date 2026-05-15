import type { StatusId, MoodId } from './constants';

export interface UserRow {
  id: string;
  nickname: string;
  partner_nickname: string | null;
  partner_id: string | null;
  current_status: StatusId | null;
  current_mood: MoodId | null;
  push_subscription: PushSubscriptionJSON | null;
  created_at: string;
  updated_at: string;
}

export interface MeResponse {
  me: UserRow;
  partner: UserRow | null;
}
