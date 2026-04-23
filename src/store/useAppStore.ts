import { create } from "zustand";
import type { AppData, Course, ScoreRecord, StudyPlan, Goal } from "../types";
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

  // Study Plans
  addStudyPlan: (plan: Omit<StudyPlan, "id" | "createdAt">) => void;
  toggleStudyPlan: (planId: string) => void;
  removeStudyPlan: (planId: string) => void;

  // Goals
  addGoal: (goal: Omit<Goal, "id" | "createdAt">) => void;
  updateGoal: (goal: Goal) => void;
  removeGoal: (goalId: string) => void;
  achieveGoal: (goalId: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  skills: DEFAULT_SKILLS,
  courses: [],
  scores: [],
  studyPlans: [],
  goals: [],
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
        studyPlans: data.studyPlans || [],
        goals: data.goals || [],
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

  addStudyPlan: (plan) => {
    set((state) => {
      const newPlan: StudyPlan = {
        ...plan,
        id: generateId(),
        createdAt: new Date().toISOString().split("T")[0],
      };
      const studyPlans = [...(state.studyPlans || []), newPlan];
      const newData = { ...state, studyPlans };
      saveAppData(newData);
      return { studyPlans };
    });
  },

  toggleStudyPlan: (planId) => {
    set((state) => {
      const studyPlans = (state.studyPlans || []).map((p) =>
        p.id === planId ? { ...p, completed: !p.completed } : p
      );
      const newData = { ...state, studyPlans };
      saveAppData(newData);
      return { studyPlans };
    });
  },

  removeStudyPlan: (planId) => {
    set((state) => {
      const studyPlans = (state.studyPlans || []).filter((p) => p.id !== planId);
      const newData = { ...state, studyPlans };
      saveAppData(newData);
      return { studyPlans };
    });
  },

  addGoal: (goal) => {
    set((state) => {
      const newGoal: Goal = {
        ...goal,
        id: generateId(),
        createdAt: new Date().toISOString().split("T")[0],
      };
      const goals = [...(state.goals || []), newGoal];
      const newData = { ...state, goals };
      saveAppData(newData);
      return { goals };
    });
  },

  updateGoal: (goal) => {
    set((state) => {
      const goals = (state.goals || []).map((g) =>
        g.id === goal.id ? goal : g
      );
      const newData = { ...state, goals };
      saveAppData(newData);
      return { goals };
    });
  },

  removeGoal: (goalId) => {
    set((state) => {
      const goals = (state.goals || []).filter((g) => g.id !== goalId);
      const newData = { ...state, goals };
      saveAppData(newData);
      return { goals };
    });
  },

  achieveGoal: (goalId) => {
    set((state) => {
      const goals = (state.goals || []).map((g) =>
        g.id === goalId
          ? { ...g, achieved: true, achievedDate: new Date().toISOString().split("T")[0] }
          : g
      );
      const newData = { ...state, goals };
      saveAppData(newData);
      return { goals };
    });
  },
}));
