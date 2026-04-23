import { useState, useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { SKILL_LABELS } from "../types";
import { SKILL_ICONS } from "../types/icons";
import EmptyState from "../components/EmptyState";
import ProgressBar from "../components/ProgressBar";
import { HiOutlineCalendar, HiOutlineCheckCircle, HiOutlineClock } from "react-icons/hi2";

const SKILL_ORDER = ["listening", "reading", "writing", "speaking"];

const SKILL_COLORS: Record<string, string> = {
  listening: "#007AFF",
  reading: "#34C759",
  writing: "#FF9500",
  speaking: "#FF2D55",
};

interface PlanForm {
  title: string;
  skillId: string;
  courseId: string;
  date: string;
  notes: string;
}

const emptyForm = (): PlanForm => ({
  title: "",
  skillId: "listening",
  courseId: "",
  date: new Date().toISOString().split("T")[0],
  notes: "",
});

export default function Schedule() {
  const { studyPlans, courses, addStudyPlan, toggleStudyPlan, removeStudyPlan } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PlanForm>(emptyForm());

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    addStudyPlan({
      title: form.title.trim(),
      skillId: form.skillId,
      courseId: form.courseId || undefined,
      date: form.date,
      completed: false,
      notes: form.notes || undefined,
    });
    setForm(emptyForm());
    setShowForm(false);
  };

  const handleCancel = () => {
    setForm(emptyForm());
    setShowForm(false);
  };

  // Group plans by date
  const plansByDate = useMemo(() => {
    const grouped: Record<string, typeof studyPlans> = {};
    const plans = studyPlans || [];
    plans.sort((a, b) => a.date.localeCompare(b.date));
    for (const plan of plans) {
      if (!grouped[plan.date]) grouped[plan.date] = [];
      grouped[plan.date]!.push(plan);
    }
    return grouped;
  }, [studyPlans]);

  // Get dates with plans
  const datesWithPlans = useMemo(() => {
    return Object.keys(plansByDate).sort((a, b) => a.localeCompare(b));
  }, [plansByDate]);

  // Stats
  const stats = useMemo(() => {
    const plans = studyPlans || [];
    const total = plans.length;
    const completed = plans.filter((p) => p.completed).length;
    const today = new Date().toISOString().split("T")[0];
    const todayPlans = plans.filter((p) => p.date === today);
    const todayCompleted = todayPlans.filter((p) => p.completed).length;
    return { total, completed, pending: total - completed, todayTotal: todayPlans.length, todayCompleted };
  }, [studyPlans]);

  // Get today's date formatted
  const todayStr = new Date().toISOString().split("T")[0];
  const todayDisplay = new Date().toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "short" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Schedule</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          + Add Plan
        </button>
      </div>

      {/* Stats bar */}
      {stats.total > 0 && (
        <div className="flex items-center gap-4 bg-white/85 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100/80">
          <div className="flex items-center gap-2">
            <HiOutlineCalendar className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">วันนี้</span>
            <span className="text-lg font-bold text-gray-800">
              {stats.todayCompleted}/{stats.todayTotal}
            </span>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex items-center gap-2">
            <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">Done</span>
            <span className="text-lg font-bold text-gray-800">{stats.completed}</span>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex items-center gap-2">
            <HiOutlineClock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-600">Pending</span>
            <span className="text-lg font-bold text-gray-800">{stats.pending}</span>
          </div>
          <div className="ml-auto">
            <ProgressBar value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} color="#34C759" size="sm" />
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-white/85 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-gray-100/80 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">เพิ่มแผนการเรียน</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">ชื่อแผน</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="เช่น ฟัง Cambridge Ch3"
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
                {SKILL_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {SKILL_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">วันที่</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white/80"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">Course (ไม่บังคับ)</label>
              <select
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white/80"
              >
                <option value="">— เลือก Course —</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">หมายเหตุ</label>
              <input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="รายละเอียดเพิ่มเติม"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white/80"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={handleCancel} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 shadow-sm cursor-pointer"
            >
              บันทึก
            </button>
          </div>
        </div>
      )}

      {/* Plans list */}
      {datesWithPlans.length === 0 ? (
        <EmptyState
          icon={<HiOutlineCalendar className="w-10 h-10" />}
          title="ยังไม่มีแผนการเรียน"
          subtitle="สร้างแผนการเรียนเพื่อติดตามความคืบหน้า"
          action={{ label: "เพิ่มแผน", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-4">
          {datesWithPlans.map((date) => {
            const isToday = date === todayStr;
            const dateDisplay = isToday
              ? todayDisplay
              : new Date(date).toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "short" });
            const dayPlans = plansByDate[date] || [];
            const completedCount = dayPlans.filter((p) => p.completed).length;

            return (
              <div key={date} className="bg-white/85 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/80 overflow-hidden">
                {/* Date header */}
                <div
                  className={`px-4 py-3 flex items-center gap-3 border-b border-gray-50 ${
                    isToday ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isToday ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {new Date(date).getDate()}
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-700">{dateDisplay}</span>
                  <span className="text-xs text-gray-400">
                    {completedCount}/{dayPlans.length} เสร็จ
                  </span>
                </div>

                {/* Plans */}
                <div className="divide-y divide-gray-50">
                  {dayPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        plan.completed ? "bg-green-50/30" : ""
                      }`}
                    >
                      <button
                        onClick={() => toggleStudyPlan(plan.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                          plan.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-green-400"
                        }`}
                      >
                        {plan.completed && "✓"}
                      </button>
                      <span
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                          plan.completed ? "bg-green-100 text-green-600" : ""
                        }`}
                        style={{
                          backgroundColor: plan.completed ? undefined : `${SKILL_COLORS[plan.skillId]}15`,
                          color: plan.completed ? undefined : SKILL_COLORS[plan.skillId],
                        }}
                      >
                        {SKILL_ICONS[plan.skillId]}
                      </span>
                      <span
                        className={`flex-1 text-sm ${
                          plan.completed ? "text-gray-400 line-through" : "text-gray-700"
                        }`}
                      >
                        {plan.title}
                      </span>
                      {plan.courseId && (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                          {courses.find((c) => c.id === plan.courseId)?.title.slice(0, 10) || ""}
                        </span>
                      )}
                      <button
                        onClick={() => removeStudyPlan(plan.id)}
                        className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded text-xs transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}