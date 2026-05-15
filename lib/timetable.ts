export interface Period {
  id: number;
  start: string;
}

export interface Lesson {
  room: string;
  subject: string;
  accent?: boolean;
}

export const PERIODS: Period[] = [
  { id: 1, start: '09:00' },
  { id: 2, start: '09:55' },
  { id: 3, start: '10:50' },
  { id: 4, start: '11:45' },
  { id: 5, start: '13:15' },
  { id: 6, start: '14:10' },
  { id: 7, start: '15:05' },
  { id: 8, start: '16:00' },
];

export const DAYS = ['월', '화', '수', '목', '금'] as const;
export type Day = (typeof DAYS)[number];

// day → periodId → Lesson
export const SCHEDULE: Record<Day, Record<number, Lesson>> = {
  월: {
    1: { room: '204', subject: '영어' },
    4: { room: '206', subject: '영어' },
    6: { room: '202', subject: '영어' },
  },
  화: {
    1: { room: '201', subject: '영어' },
    3: { room: '204', subject: '영어' },
    4: { room: '203', subject: '영어' },
    7: { room: '205', subject: '영어' },
  },
  수: {
    1: { room: '105', subject: '정보', accent: true },
    3: { room: '206', subject: '영어' },
    5: { room: '202', subject: '영어' },
    6: { room: '201', subject: '영어' },
  },
  목: {
    1: { room: '203', subject: '영어' },
    3: { room: '201', subject: '영어' },
    5: { room: '205', subject: '영어' },
    7: { room: '206', subject: '영어' },
  },
  금: {
    2: { room: '204', subject: '영어' },
    3: { room: '203', subject: '영어' },
    5: { room: '202', subject: '영어' },
    6: { room: '205', subject: '영어' },
  },
};

export const TIMETABLE_OWNER = '젠';
export const TIMETABLE_UPDATED = '2026-05-11';
