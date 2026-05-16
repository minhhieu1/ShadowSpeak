export type Lesson = {
  lessonId: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  durationMinutes: number;
  lines: number;
};

export const demoLessons: Lesson[] = [
  {
    lessonId: 'lesson_cafe_small_talk_001',
    title: 'Cafe Small Talk',
    level: 'beginner',
    topic: 'conversation',
    durationMinutes: 8,
    lines: 24,
  },
  {
    lessonId: 'lesson_traveling_abroad_001',
    title: 'At the Airport',
    level: 'intermediate',
    topic: 'travel',
    durationMinutes: 12,
    lines: 36,
  },
  {
    lessonId: 'lesson_business_meeting_001',
    title: 'Quick Team Update',
    level: 'advanced',
    topic: 'business',
    durationMinutes: 10,
    lines: 32,
  },
];

export const demoProgress = {
  streakDays: 3,
  minutesPracticed: 42,
  completedLessonCount: 5,
};
