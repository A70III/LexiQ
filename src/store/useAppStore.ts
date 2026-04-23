import { create } from "zustand";
import type { AppData, Course, ScoreRecord } from "../types";
import { DEFAULT_SKILLS } from "../types";
import { loadAppData, saveAppData } from "../lib/storage";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

interface AppStore extends AppData {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadData: () => Promise<void>;

  // Skills
  updateSkillTarget: (skillId: string, targetBand: number) => void;

  // Courses
  addCourse: (course: Omit<Course, "id" | "createdAt">) => void;
  updateCourse: (course: Course) => void;
  removeCourse: (courseId: string) => void;
  incrementLesson: (courseId: string) => void;
  decrementLesson: (courseId: string) => void;

  // Scores
  addScore: (score: Omit<ScoreRecord, "id">) => void;
  removeScore: (scoreId: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  skills: DEFAULT_SKILLS,
  courses: [],
  scores: [],
  isLoaded: false,
  isLoading: false,
  error: null,

  loadData: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await loadAppData();
      set({
        skills: data.skills || DEFAULT_SKILLS,
        courses: data.courses || [],
        scores: data.scores || [],
        isLoaded: true,
        isLoading: false,
      });
    } catch (e) {
      set({
        error: "Failed to load data",
        isLoading: false,
        isLoaded: true,
      });
    }
  },

  updateSkillTarget: (skillId, targetBand) => {
    set((state) => {
      const skills = state.skills.map((s) =>
        s.id === skillId ? { ...s, targetBand } : s
      );
      const newData = { ...state, skills };
      saveAppData(newData);
      return { skills };
    });
  },

  addCourse: (course) => {
    set((state) => {
      const newCourse: Course = {
        ...course,
        id: generateId(),
        createdAt: new Date().toISOString().split("T")[0],
      };
      const courses = [...state.courses, newCourse];
      const newData = { ...state, courses };
      saveAppData(newData);
      return { courses };
    });
  },

  updateCourse: (course) => {
    set((state) => {
      const courses = state.courses.map((c) =>
        c.id === course.id ? course : c
      );
      const newData = { ...state, courses };
      saveAppData(newData);
      return { courses };
    });
  },

  removeCourse: (courseId) => {
    set((state) => {
      const courses = state.courses.filter((c) => c.id !== courseId);
      const newData = { ...state, courses };
      saveAppData(newData);
      return { courses };
    });
  },

  incrementLesson: (courseId) => {
    set((state) => {
      const courses = state.courses.map((c) => {
        if (c.id !== courseId) return c;
        const completedLessons = Math.min(c.completedLessons + 1, c.totalLessons);
        return { ...c, completedLessons };
      });
      const newData = { ...state, courses };
      saveAppData(newData);
      return { courses };
    });
  },

  decrementLesson: (courseId) => {
    set((state) => {
      const courses = state.courses.map((c) => {
        if (c.id !== courseId) return c;
        const completedLessons = Math.max(c.completedLessons - 1, 0);
        return { ...c, completedLessons };
      });
      const newData = { ...state, courses };
      saveAppData(newData);
      return { courses };
    });
  },

  addScore: (score) => {
    set((state) => {
      const newScore: ScoreRecord = {
        ...score,
        id: generateId(),
      };
      const scores = [...state.scores, newScore];
      const newData = { ...state, scores };
      saveAppData(newData);
      return { scores };
    });
  },

  removeScore: (scoreId) => {
    set((state) => {
      const scores = state.scores.filter((s) => s.id !== scoreId);
      const newData = { ...state, scores };
      saveAppData(newData);
      return { scores };
    });
  },
}));
