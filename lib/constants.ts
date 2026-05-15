export const STATUSES = [
  { id: 'home',        label: '집',     emoji: '🏠' },
  { id: 'school',      label: '학교',   emoji: '🏫' },
  { id: 'workout',     label: '운동중', emoji: '🏃' },
  { id: 'rest',        label: '쉬는중', emoji: '☕' },
  { id: 'free_period', label: '공강',   emoji: '📚' },
  { id: 'sleep',       label: '자는중', emoji: '😴' },
] as const;

export const MOODS = [
  { id: 'bad',        label: '나쁨',     emoji: '😞' },
  { id: 'sad',        label: '슬픔',     emoji: '😢' },
  { id: 'happy',      label: '기쁨',     emoji: '😊' },
  { id: 'angry',      label: '화남',     emoji: '😠' },
  { id: 'fun',        label: '즐거움',   emoji: '😄' },
  { id: 'dont_touch', label: '건들지마', emoji: '🙅' },
] as const;

export type StatusId = (typeof STATUSES)[number]['id'];
export type MoodId = (typeof MOODS)[number]['id'];

export const STATUS_MAP: Record<string, (typeof STATUSES)[number]> =
  Object.fromEntries(STATUSES.map((s) => [s.id, s]));
export const MOOD_MAP: Record<string, (typeof MOODS)[number]> =
  Object.fromEntries(MOODS.map((m) => [m.id, m]));
