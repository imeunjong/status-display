import {
  Home, Briefcase, Dumbbell, Coffee, BookOpen, Moon,
  Frown, CloudRain, Smile, Flame, Laugh, Ban,
  type LucideIcon,
} from 'lucide-react';
import type { StatusId, MoodId } from './constants';

export const STATUS_ICON: Record<StatusId, LucideIcon> = {
  home: Home,
  school: Briefcase,
  workout: Dumbbell,
  rest: Coffee,
  free_period: BookOpen,
  sleep: Moon,
};

export const MOOD_ICON: Record<MoodId, LucideIcon> = {
  bad: Frown,
  sad: CloudRain,
  happy: Smile,
  angry: Flame,
  fun: Laugh,
  dont_touch: Ban,
};
