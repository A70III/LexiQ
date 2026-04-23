import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppData, Course, ScoreRecord, StudyPlan, Goal } from '../types';
import { getAllData, saveAllData, resetAllData } from '../lib/indexedDB';
import { initDB, seedDefaultSkills } from '../lib/db';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

interface AppStore extends AppData {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  lastSyncDate: string | null;
  serverAddress: string;
  offline: boolean;

  loadData: () => Promise<void>;

  updateSkillTarget: (skillId: string, targetBand: number) => void;
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  updateCourse: (course: Course) => void;
  removeCourse: (courseId: string) => void;
  incrementLesson: (courseId: string) => void;
  decrementLesson: (courseId: string) => void;

  addScore: (score: Omit<ScoreRecord, 'id'>) => void;
  removeScore: (scoreId: string) => void;

  addStudyPlan: (plan: Omit<StudyPlan, 'id' | 'createdAt'>) => void;
  toggleStudyPlan: (planId: string) => void;
  removeStudyPlan: (planId: string) => void;

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (goal: Goal) => void;
  removeGoal: (goalId: string) => void;
  achieveGoal: (goalId: string) => void;

  setServerAddress: (address: string) => void;
  setLastSyncDate: (date: string) => void;
  setOffline: (offline: boolean) => void;
  resetAll: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      skills: [],
      courses: [],
      scores: [],
      studyPlans: [],
      goals: [],
      isLoaded: false,
      isLoading: false,
      error: null,
      lastSyncDate: null,
      serverAddress: '',
      offline: typeof navigator !== 'undefined' ? !navigator.onLine : false,

      loadData: async () => {
        set({ isLoading: true, error: null });
        try {
          await initDB();
          const data = await getAllData();
          set({
            ...data,
            isLoaded: true,
            isLoading: false,
          });
        } catch (e) {
          console.error('DB load error:', e);
          set({
            error: 'Failed to load data',
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
          return { skills };
        });
        get().saveToStorage();
      },

      addCourse: (course) => {
        set((state) => {
          const newCourse: Course = {
            ...course,
            id: generateId(),
            createdAt: new Date().toISOString().split('T')[0],
          };
          const courses = [...state.courses, newCourse];
          return { courses };
        });
        get().saveToStorage();
      },

      updateCourse: (course) => {
        set((state) => {
          const courses = state.courses.map((c) => (c.id === course.id ? course : c));
          return { courses };
        });
        get().saveToStorage();
      },

      removeCourse: (courseId) => {
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== courseId),
        }));
        get().saveToStorage();
      },

      incrementLesson: (courseId) => {
        set((state) => {
          const courses = state.courses.map((c) => {
            if (c.id !== courseId) return c;
            const completedLessons = Math.min(c.completedLessons + 1, c.totalLessons);
            return { ...c, completedLessons };
          });
          return { courses };
        });
        get().saveToStorage();
      },

      decrementLesson: (courseId) => {
        set((state) => {
          const courses = state.courses.map((c) => {
            if (c.id !== courseId) return c;
            const completedLessons = Math.max(c.completedLessons - 1, 0);
            return { ...c, completedLessons };
          });
          return { courses };
        });
        get().saveToStorage();
      },

      addScore: (score) => {
        set((state) => {
          const newScore: ScoreRecord = {
            ...score,
            id: generateId(),
          };
          const scores = [...state.scores, newScore];
          return { scores };
        });
        get().saveToStorage();
      },

      removeScore: (scoreId) => {
        set((state) => ({
          scores: state.scores.filter((s) => s.id !== scoreId),
        }));
        get().saveToStorage();
      },

      addStudyPlan: (plan) => {
        set((state) => {
          const newPlan: StudyPlan = {
            ...plan,
            id: generateId(),
            createdAt: new Date().toISOString().split('T')[0],
          };
          const studyPlans = [...(state.studyPlans || []), newPlan];
          return { studyPlans };
        });
        get().saveToStorage();
      },

      toggleStudyPlan: (planId) => {
        set((state) => {
          const studyPlans = (state.studyPlans || []).map((p) =>
            p.id === planId ? { ...p, completed: !p.completed } : p
          );
          return { studyPlans };
        });
        get().saveToStorage();
      },

      removeStudyPlan: (planId) => {
        set((state) => ({
          studyPlans: (state.studyPlans || []).filter((p) => p.id !== planId),
        }));
        get().saveToStorage();
      },

      addGoal: (goal) => {
        set((state) => {
          const newGoal: Goal = {
            ...goal,
            id: generateId(),
            createdAt: new Date().toISOString().split('T')[0],
          };
          const goals = [...(state.goals || []), newGoal];
          return { goals };
        });
        get().saveToStorage();
      },

      updateGoal: (goal) => {
        set((state) => {
          const goals = (state.goals || []).map((g) => (g.id === goal.id ? goal : g));
          return { goals };
        });
        get().saveToStorage();
      },

      removeGoal: (goalId) => {
        set((state) => ({
          goals: (state.goals || []).filter((g) => g.id !== goalId),
        }));
        get().saveToStorage();
      },

      achieveGoal: (goalId) => {
        set((state) => {
          const goals = (state.goals || []).map((g) =>
            g.id === goalId
              ? { ...g, achieved: true, achievedDate: new Date().toISOString().split('T')[0] }
              : g
          );
          return { goals };
        });
        get().saveToStorage();
      },

      setServerAddress: (address) => set({ serverAddress: address }),
      setLastSyncDate: (date) => set({ lastSyncDate: date }),
      setOffline: (offline) => set({ offline }),

      resetAll: async () => {
        await resetAllData();
        await seedDefaultSkills();
        const data = await getAllData();
        set({
          skills: data.skills || [],
          courses: data.courses || [],
          scores: data.scores || [],
          studyPlans: data.studyPlans || [],
          goals: data.goals || [],
        });
      },

      saveToStorage: async () => {
        const state = get();
        await saveAllData({
          skills: state.skills,
          courses: state.courses,
          scores: state.scores,
          studyPlans: state.studyPlans,
          goals: state.goals,
        });
      },
    }),
    {
      name: 'lexiq-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        serverAddress: state.serverAddress,
        lastSyncDate: state.lastSyncDate,
      }),
    }
  )
);

// Online/offline detection
if (typeof window !== 'undefined') {
  const setOffline = useAppStore.getState().setOffline;
  window.addEventListener('online', () => setOffline(false));
  window.addEventListener('offline', () => setOffline(true));
}