export type SubjectColorKey =
  | 'violet'
  | 'indigo'
  | 'lilac'
  | 'slate'
  | 'sage'
  | 'amber';

export interface Subject {
  id: string;
  name: string;
  targetHours: number;
  completedHours: number;
  color: SubjectColorKey;
}

export interface StudyLog {
  id: string;
  date: string; // YYYY-MM-DD (local date)
  subjectId: string;
  hours: number;
  note?: string;
  createdAt: number;
}

export interface StudyTask {
  id: string;
  title: string;
  subjectId: string;
  details: string;
  plannedHours: number;
  timeSlot?: string;
  completed: boolean;
  createdAt: number;
}
