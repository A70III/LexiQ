import { useState, useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { SKILL_LABELS } from "../types";
import { SKILL_ICONS } from "../types/icons";
import BandBadge from "../components/BandBadge";
import EmptyState from "../components/EmptyState";
import { HiOutlineFlag, HiOutlineTrophy, HiOutlineClock } from "react-icons/hi2";

const SKILL_ORDER = ["listening", "reading", "writing", "speaking"];

const SKILL_COLORS: Record<string, string> = {
  listening: "#007AFF",
  reading: "#34C759",
  writing: "#FF9500",
  speaking: "#FF2D55",
};

interface GoalForm {
  skillId: string;
  targetBand: string;
  targetDate: string;
}

const defaultForm = (): GoalForm => ({
  skillId: "listening",
  targetBand: "7.0",
  targetDate: "",
});

export default function Goals() {
  const { goals, scores, addGoal, removeGoal, achieveGoal } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GoalForm>(defaultForm());

  const handleSubmit = () => {
    const band = parseFloat(form.targetBand);
    if (isNaN(band) || band < 0 || band > 9 || !form.targetDate) return;
    addGoal({
      skillId: form.skillId,
      targetBand: band,
      targetDate: form.targetDate,
      achieved: false,
    });
    setForm(defaultForm());
    setShowForm(false);
  };

  const handleCancel = () => {
    setForm(defaultForm());
    setShowForm(false);
  };

  // Get current band for each skill
  const currentBands = useMemo(() => {
    const map: Record<string, number> = {};
    for (const skillId of SKILL_ORDER) {
      const skillScores = scores.filter((s) => s.skillId === skillId).sort((a, b) => b.date.localeCompare(a.date));
      map[skillId] = skillScores[0]?.band ?? 0;
    }
    return map;
  }, [scores]);

  // Goals by skill
  const goalsBySkill = useMemo(() => {
    const grouped: Record<string, typeof goals> = {};
    const list = goals || [];
    list.sort((a, b) => a.targetDate.localeCompare(b.targetDate));
    for (const goal of list) {
      if (!grouped[goal.skillId]) grouped[goal.skillId] = [];
      grouped[goal.skillId]!.push(goal);
    }
    return grouped;
  }, [goals]);

  // Stats
  const stats = useMemo(() => {
    const list = goals || [];
    const total = list.length;
    const achieved = list.filter((g) => g.achieved).length;
    const active = total - achieved;
    const today = new Date().toISOString().split("T")[0];
    const overdue = list.filter((g) => !g.achieved && g.targetDate < today).length;
    return { total, achieved, active, overdue };
  }, [goals]);

  // Check if skill already has active goal
  const hasActiveGoal = (skillId: string) => {
    return (goals || []).some((g) => g.skillId === skillId && !g.achieved);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Goals</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          + Add Goal
        </button>
      </div>

      {/* Stats bar */}
      {stats.total > 0 && (
        <div className="flex items-center gap-4 bg-white/85 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100/80">
          <div className="flex items-center gap-2">
            <HiOutlineTrophy className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-600">บรรลุแล้ว</span>
            <span className="text-lg font-bold text-gray-800">{stats.achieved}</span>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex items-center gap-2">
            <HiOutlineFlag className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">กำลังไล่</span>
            <span className="text-lg font-bold text-gray-800">{stats.active}</span>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex items-center gap-2">
            <HiOutlineClock className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-600">เลยกำหนด</span>
            <span className="text-lg font-bold text-red-500">{stats.overdue}</span>
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-white/85 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-gray-100/80 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">ตั้งเป้าหมาย</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">Skill</label>
              <select
                value={form.skillId}
                onChange={(e) => setForm({ ...form, skillId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white/80"
              >
                {SKILL_ORDER.map((s) => {
                  const hasGoal = hasActiveGoal(s);
                  return (
                    <option key={s} value={s} disabled={hasGoal}>
                      {SKILL_LABELS[s]} {hasGoal ? "(มีเป้าอยู่)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">Target Band</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="9"
                value={form.targetBand}
                onChange={(e) => setForm({ ...form, targetBand: e.target.value })}
                placeholder="7.0"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white/80"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">วันที่ต้องการบรรลุ</label>
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
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

      {/* Goals list */}
      {stats.total === 0 ? (
        <EmptyState
          icon={<HiOutlineFlag className="w-10 h-10" />}
          title="ยังไม่มีเป้าหมาย"
          subtitle="ตั้งเป้าหมาย Band Score เพื่อไล่ตาม"
          action={{ label: "ตั้งเป้า", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SKILL_ORDER.map((skillId) => {
            const skillGoals = goalsBySkill[skillId] || [];
            if (skillGoals.length === 0) return null;

            const currentBand = currentBands[skillId] || 0;
            const latestGoal = skillGoals.find((g) => !g.achieved);
            const isOverdue =
              latestGoal && latestGoal.targetDate < todayStr;
            const gap = latestGoal ? latestGoal.targetBand - currentBand : 0;

            return (
              <div
                key={skillId}
                className="bg-white/85 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/80 overflow-hidden"
              >
                {/* Header */}
                <div
                  className="px-4 py-3 flex items-center gap-3"
                  style={{
                    background: `linear-gradient(135deg, ${SKILL_COLORS[skillId]}12, ${SKILL_COLORS[skillId]}06)`,
                  }}
                >
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${SKILL_COLORS[skillId]}18` }}
                  >
                    {SKILL_ICONS[skillId]}
                  </span>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-800">
                      {SKILL_LABELS[skillId]}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">
                        ปัจจุบัน: {currentBand > 0 ? currentBand.toFixed(1) : "-"}
                      </span>
                      {latestGoal && (
                        <>
                          <span className="text-gray-300">→</span>
                          <span
                            className={`text-xs font-medium ${
                              isOverdue ? "text-red-500" : "text-gray-600"
                            }`}
                          >
                            เป้า: {latestGoal.targetBand.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {latestGoal && (
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${
                          isOverdue ? "text-red-500" : "text-gray-800"
                        }`}
                      >
                        {gap > 0 ? `+${gap.toFixed(1)}` : gap.toFixed(1)}
                      </span>
                      <p className="text-[10px] text-gray-400">Band gap</p>
                    </div>
                  )}
                </div>

                {/* Goals timeline */}
                <div className="p-4 space-y-2">
                  {skillGoals.map((goal) => {
                    const isActive = !goal.achieved;
                    const isPast = goal.targetDate < todayStr && !goal.achieved;

                    return (
                      <div
                        key={goal.id}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          goal.achieved
                            ? "bg-green-50/50"
                            : isPast
                            ? "bg-red-50/50"
                            : "bg-gray-50/50"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            goal.achieved
                              ? "bg-green-500"
                              : isPast
                              ? "bg-red-400"
                              : "bg-blue-400"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <BandBadge
                              band={goal.targetBand}
                              size="sm"
                              highlight={
                                goal.achieved
                                  ? "green"
                                  : isPast
                                  ? "red"
                                  : undefined
                              }
                            />
                            <span
                              className={`text-xs ${
                                goal.achieved
                                  ? "text-green-600"
                                  : isPast
                                  ? "text-red-500"
                                  : "text-gray-500"
                              }`}
                            >
                              {new Date(goal.targetDate).toLocaleDateString("th-TH", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          {goal.achieved && goal.achievedDate && (
                            <span className="text-[10px] text-green-500">
                              บรรลุเมื่อ{" "}
                              {new Date(goal.achievedDate).toLocaleDateString("th-TH", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          )}
                        </div>
                        {isActive && currentBand >= goal.targetBand && (
                          <button
                            onClick={() => achieveGoal(goal.id)}
                            className="px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors cursor-pointer"
                          >
                            Mark Done
                          </button>
                        )}
                        <button
                          onClick={() => removeGoal(goal.id)}
                          className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded text-xs transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}