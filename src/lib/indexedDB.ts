import Dexie, { type Table } from 'dexie';
import type { Skill, Course, ScoreRecord, StudyPlan, Goal } from '../types';

export interface DBSkill extends Skill {}
export interface DBCourse extends Course {}
export interface DBScore extends ScoreRecord {}
export interface DBStudyPlan extends StudyPlan {}
export interface DBGoal extends Goal {}

export class LexiQDB extends Dexie {
  skills!: Table<DBSkill>;
  courses!: Table<DBCourse>;
  scores!: Table<DBScore>;
  studyPlans!: Table<DBStudyPlan>;
  goals!: Table<DBGoal>;

  constructor() {
    super('LexiQDB');
    this.version(1).stores({
      skills: 'id, name, icon, targetBand, color',
      courses: 'id, title, skillId, totalLessons, completedLessons, source, notes, createdAt',
      scores: 'id, skillId, band, date, testName, notes',
      studyPlans: 'id, title, skillId, courseId, date, completed, notes, createdAt',
      goals: 'id, skillId, targetBand, targetDate, achieved, achievedDate, createdAt',
    });
  }
}

export const db = new LexiQDB();

export async function seedDefaultSkills() {
  const count = await db.skills.count();
  if (count === 0) {
    await db.skills.bulkAdd([
      { id: 'listening', name: 'Listening', icon: '🎧', targetBand: 7, color: '#007AFF' },
      { id: 'reading', name: 'Reading', icon: '📖', targetBand: 7, color: '#34C759' },
      { id: 'writing', name: 'Writing', icon: '✍️', targetBand: 7, color: '#FF9500' },
      { id: 'speaking', name: 'Speaking', icon: '🎤', targetBand: 7, color: '#FF2D55' },
    ]);
  }
}

export async function resetAllData() {
  await db.transaction('rw', [db.skills, db.courses, db.scores, db.studyPlans, db.goals], async () => {
    await db.skills.clear();
    await db.courses.clear();
    await db.scores.clear();
    await db.studyPlans.clear();
    await db.goals.clear();
  });
}

export interface AppData {
  skills: Skill[];
  courses: Course[];
  scores: ScoreRecord[];
  studyPlans: StudyPlan[];
  goals: Goal[];
}

export async function getAllData(): Promise<AppData> {
  return {
    skills: await db.skills.toArray(),
    courses: await db.courses.toArray(),
    scores: await db.scores.toArray(),
    studyPlans: await db.studyPlans.toArray(),
    goals: await db.goals.toArray(),
  };
}

export async function saveAllData(data: AppData): Promise<void> {
  await db.transaction('rw', [db.skills, db.courses, db.scores, db.studyPlans, db.goals], async () => {
    await db.skills.clear();
    await db.courses.clear();
    await db.scores.clear();
    await db.studyPlans.clear();
    await db.goals.clear();
    if (data.skills?.length) await db.skills.bulkAdd(data.skills);
    if (data.courses?.length) await db.courses.bulkAdd(data.courses);
    if (data.scores?.length) await db.scores.bulkAdd(data.scores);
    if (data.studyPlans?.length) await db.studyPlans.bulkAdd(data.studyPlans);
    if (data.goals?.length) await db.goals.bulkAdd(data.goals);
  });
}