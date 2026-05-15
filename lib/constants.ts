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

// 기분지수 매트릭스 (0~100): 상태 × 기분 36 케이스
// 행: 상태 / 열: 기분 (bad, sad, happy, angry, fun, dont_touch)
export const MOOD_SCORE: Record<StatusId, Record<MoodId, number>> = {
  home:        { bad: 38, sad: 48, happy: 85, angry: 32, fun: 92, dont_touch: 55 },
  school:      { bad: 22, sad: 32, happy: 72, angry: 18, fun: 82, dont_touch: 35 },
  workout:     { bad: 42, sad: 50, happy: 88, angry: 38, fun: 95, dont_touch: 52 },
  rest:        { bad: 48, sad: 58, happy: 90, angry: 42, fun: 96, dont_touch: 65 },
  free_period: { bad: 32, sad: 42, happy: 80, angry: 28, fun: 88, dont_touch: 48 },
  sleep:       { bad: 52, sad: 62, happy: 82, angry: 40, fun: 85, dont_touch: 72 },
};

export function scoreOf(status: StatusId | null | undefined, mood: MoodId | null | undefined): number | null {
  if (!status || !mood) return null;
  return MOOD_SCORE[status]?.[mood] ?? null;
}

export function scoreLabel(score: number): string {
  if (score >= 90) return '아주 좋음';
  if (score >= 75) return '좋음';
  if (score >= 60) return '괜찮음';
  if (score >= 45) return '그저 그럼';
  if (score >= 30) return '별로';
  return '바닥';
}
