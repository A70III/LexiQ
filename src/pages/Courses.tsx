import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import ProgressBar from "../components/ProgressBar";
import EmptyState from "../components/EmptyState";
import { HiOutlinePencilSquare } from "react-icons/hi2";

const SKILL_COLORS: Record<string, string> = {
  listening: "#007AFF",
  reading: "#34C759",
  writing: "#FF9500",
  speaking: "#FF2D55",
};

interface CourseForm {
  title: string;
  skillId: string;
  totalLessons: number;
  source: string;
}

const emptyForm: CourseForm = { title: "", skillId: "listening", totalLessons: 10, source: "" };

export default function Courses() {
  const { courses, skills, addCourse, removeCourse, incrementLesson, decrementLesson } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [errors, setErrors] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.title.trim()) {
      setErrors("กรุณากรอกชื่อ Course");
      return;
    }
    setErrors(null);
    addCourse({ title: form.title.trim(), skillId: form.skillId, totalLessons: form.totalLessons, completedLessons: 0, source: form.source || undefined });
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setErrors(null);
    setShowForm(false);
  };

  const coursesBySkill = skills.map((s) => ({ ...s, items: courses.filter((c) => c.skillId === s.id) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Courses</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          + Add Course
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white/85 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-gray-100/80 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">เพิ่ม Course ใหม่</h3>
          {errors && (
            <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
              {errors}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">ชื่อ Course</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="z.B. Cambridge IELTS 18"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white/80"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">Skill</label>
              <select
                value={form.skillId}
                onChange={(e) => setForm({ ...form, skillId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white/80"
              >
                {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">จำนวนบทเรียนทั้งหมด</label>
              <input
                type="number"
                min={1}
                value={form.totalLessons}
                onChange={(e) => setForm({ ...form, totalLessons: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white/80"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">ที่มา (เช่นชื่อคอร์ส/แพลตฟอร์ม)</label>
              <input
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="z.B. KruDew, LinguaSkill, YouTube"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white/80"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={handleCancel} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 shadow-sm cursor-pointer">บันทึก</button>
          </div>
        </div>
      )}

      {/* Course list by skill */}
      {courses.length === 0 ? (
        <EmptyState
          icon={<HiOutlinePencilSquare className="w-10 h-10" />}
          title="ยังไม่มี Course"
          subtitle="เพิ่ม course ที่คุณซื้อมา และติดตามความคืบหน้าแต่ละบทเรียน"
          action={{ label: "เพิ่ม Course", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-4">
          {coursesBySkill.map(({ id, name, icon, items, color }) =>
            items.length > 0 ? (
              <div key={id}>
                <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                  <span>{icon}</span> {name}
                </h3>
                <div className="space-y-2">
                  {items.map((c) => {
                    const pct = c.totalLessons > 0 ? Math.round((c.completedLessons / c.totalLessons) * 100) : 0;
                    const isComplete = c.completedLessons >= c.totalLessons;
                    return (
                      <div
                        key={c.id}
                        className="bg-white/85 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/80 overflow-hidden card-hover"
                        style={{ borderLeft: `3px solid ${SKILL_COLORS[c.skillId] || color}` }}
                      >
                        <div className="flex items-center gap-3 p-3">
                          {isComplete ? (
                            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">✓</div>
                          ) : (
                            <>
                              <button
                                onClick={() => decrementLesson(c.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400 hover:bg-red-50 text-sm cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                disabled={c.completedLessons <= 0}
                              >
                                −
                              </button>
                              <button
                                onClick={() => incrementLesson(c.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-500 hover:bg-green-50 text-sm cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                disabled={c.completedLessons >= c.totalLessons}
                              >
                                +
                              </button>
                            </>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-800 truncate">{c.title}</span>
                              {c.source && <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded font-medium">{c.source}</span>}
                              {isComplete && <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">Complete ✓</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 max-w-48">
                                <ProgressBar value={pct} color={SKILL_COLORS[c.skillId] || color} size="sm" />
                              </div>
                              <span className="text-xs text-gray-500 tabular-nums">{c.completedLessons}/{c.totalLessons} ({pct}%)</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeCourse(c.id)}
                            className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg text-sm transition-colors cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
