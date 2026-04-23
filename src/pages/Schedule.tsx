import { useState, useMemo, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { th } from "date-fns/locale";
import { useAppStore } from "../store/useAppStore";
import { SKILL_LABELS } from "../types";
import ProgressBar from "../components/ProgressBar";
import { HiOutlineCheckCircle, HiOutlineClock } from "react-icons/hi2";

const locales = { "th": th };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface PlanForm {
  title: string;
  skillId: string;
  courseId: string;
  date: string;
  notes: string;
}

const emptyForm = (date?: string): PlanForm => ({
  title: "",
  skillId: "listening",
  courseId: "",
  date: date || new Date().toISOString().split("T")[0],
  notes: "",
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: {
    planId: string;
    skillId: string;
    courseId?: string;
    completed: boolean;
  };
}

export default function Schedule() {
  const { studyPlans, courses, addStudyPlan, toggleStudyPlan, removeStudyPlan } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PlanForm>(emptyForm());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const events: CalendarEvent[] = useMemo(() => {
    return (studyPlans || []).map((plan) => {
      const dateParts = plan.date.split("-");
      const start = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      return {
        id: plan.id,
        title: plan.title,
        start,
        end: start,
        allDay: true,
        resource: {
          planId: plan.id,
          skillId: plan.skillId,
          courseId: plan.courseId,
          completed: plan.completed,
        },
      };
    });
  }, [studyPlans]);

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
    setSelectedEvent(null);
  };

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    const dateStr = format(start, "yyyy-MM-dd");
    setForm(emptyForm(dateStr));
    setShowForm(true);
    setSelectedEvent(null);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    const plan = studyPlans?.find((p) => p.id === event.resource.planId);
    if (plan) {
      setForm({
        title: plan.title,
        skillId: plan.skillId,
        courseId: plan.courseId || "",
        date: plan.date,
        notes: plan.notes || "",
      });
      setShowForm(true);
    }
  }, [studyPlans]);

  const handleDeletePlan = () => {
    if (selectedEvent) {
      removeStudyPlan(selectedEvent.resource.planId);
      handleCancel();
    }
  };

  const handleToggleComplete = () => {
    if (selectedEvent) {
      toggleStudyPlan(selectedEvent.resource.planId);
      handleCancel();
    }
  };

  const stats = useMemo(() => {
    const plans = studyPlans || [];
    const total = plans.length;
    const completed = plans.filter((p) => p.completed).length;
    return { total, completed, pending: total - completed };
  }, [studyPlans]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Schedule</h2>
        <button
          onClick={() => {
            setForm(emptyForm());
            setShowForm(true);
            setSelectedEvent(null);
          }}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          + Add Plan
        </button>
      </div>

      {stats.total > 0 && (
        <div className="flex items-center gap-4 bg-white/85 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-gray-100/80">
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

      <div className="bg-white/85 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/80 overflow-hidden">
        <Calendar<CalendarEvent>
          localizer={localizer}
          events={events}
          view={Views.MONTH}
          date={currentDate}
          onNavigate={setCurrentDate}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          defaultView={Views.MONTH}
          views={[Views.MONTH]}
          eventPropGetter={() => ({
            className: "bg-transparent border-0",
          })}
          dayPropGetter={(_date) => ({
            className: "p-1 hover:bg-gray-50",
          })}
          style={{ height: 600 }}
          className="rbc-calendar"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedEvent ? "Edit Plan" : "เพิ่มแผนการเรียน"}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-medium">ชื่อแผน</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="เช่น ฟัง Cambridge Ch3"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white/80"
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5 font-medium">Skill</label>
                  <select
                    value={form.skillId}
                    onChange={(e) => setForm({ ...form, skillId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white/80"
                  >
                    {Object.entries(SKILL_LABELS).map(([id, label]) => (
                      <option key={id} value={id}>{label}</option>
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
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-medium">Course (ไม่บังคับ)</label>
                <select
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white/80"
                >
                  <option value="">— เลือก Course —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-medium">หมายเหตุ</label>
                <input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="รายละเอียดเพิ่มเติม"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white/80"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-between mt-5 pt-2 border-t border-gray-100">
              {selectedEvent && (
                <div className="flex gap-2">
                  <button
                    onClick={handleToggleComplete}
                    className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg cursor-pointer"
                  >
                    {selectedEvent.resource.completed ? "Undo" : "Complete"}
                  </button>
                  <button
                    onClick={handleDeletePlan}
                    className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              )}
              <div className="flex gap-2 ml-auto">
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
          </div>
        </div>
      )}
    </div>
  );
}