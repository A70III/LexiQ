export interface Skill {
  id: string;
  name: string;
  icon: string;
  targetBand: number;
  color: string;
}

export interface Course {
  id: string;
  title: string;
  skillId: string;
  totalLessons: number;
  completedLessons: number;
  source?: string;
  notes?: string;
  createdAt: string;
}

export interface ScoreRecord {
  id: string;
  skillId: string;
  band: number;
  date: string;
  testName?: string;
  notes?: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  skillId: string;
  courseId?: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  skillId: string;
  targetBand: number;
  targetDate: string;
  achieved: boolean;
  achievedDate?: string;
  createdAt: string;
}

export interface AppData {
  skills: Skill[];
  courses: Course[];
  scores: ScoreRecord[];
  studyPlans: StudyPlan[];
  goals: Goal[];
}

export const DEFAULT_SKILLS: Skill[] = [
  { id: "listening", name: "Listening", icon: "🎧", targetBand: 7, color: "#007AFF" },
  { id: "reading", name: "Reading", icon: "📖", targetBand: 7, color: "#34C759" },
  { id: "writing", name: "Writing", icon: "✍️", targetBand: 7, color: "#FF9500" },
  { id: "speaking", name: "Speaking", icon: "🎤", targetBand: 7, color: "#FF2D55" },
];

export const SKILL_LABELS: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

// SKILL_ICONS moved to src/types/icons.tsx (JSX required tsx extension)
