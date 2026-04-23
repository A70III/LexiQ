import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { SKILL_ICONS } from "../types/icons";

const SKILL_LABELS: Record<string, string> = { listening: "Listening", reading: "Reading", writing: "Writing", speaking: "Speaking" };
const SKILL_COLORS: Record<string, string> = { listening: "#007AFF", reading: "#34C759", writing: "#FF9500", speaking: "#FF2D55" };

const TARGET_OPTIONS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

export default function Settings() {
  const { skills, scores, updateSkillTarget } = useAppStore();

  const currentBand = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of skills) {
      const skillScores = scores.filter((sc) => sc.skillId === s.id);
      if (skillScores.length > 0) {
        map[s.id] = skillScores.reduce((sum, sc) => sum + sc.band, 0) / skillScores.length;
      } else {
        map[s.id] = 0;
      }
    }
    return map;
  }, [skills, scores]);

  const handleTargetChange = (skillId: string, val: string) => {
    const band = parseInt(val);
    if (band >= 1 && band <= 9) updateSkillTarget(skillId, band);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Settings</h2>

      {/* Target Band — iOS-style picker cards */}
      <div className="bg-white/85 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-gray-100/80">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">ตั้งเป้าหมายคะแนน (Target Band)</h3>
        <p className="text-xs text-gray-400 mb-5">กำหนดคะแนนที่ต้องการสำหรับแต่ละทักษะ</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skills.map((skill) => {
            const avg = currentBand[skill.id];
            const diff = avg > 0 ? skill.targetBand - avg : 0;
            const progressPct = avg > 0 ? Math.min(100, (avg / skill.targetBand) * 100) : 0;

            return (
              <div
                key={skill.id}
                className="relative overflow-hidden rounded-xl border border-gray-100/80 bg-white/60"
                style={{ borderLeft: `3px solid ${SKILL_COLORS[skill.id]}` }}
              >
                {/* Progress indicator strip */}
                {avg > 0 && (
                  <div
                    className="absolute bottom-0 left-0 h-1 transition-all duration-500"
                    style={{
                      width: `${progressPct}%`,
                      backgroundColor: progressPct >= 100 ? "#34C759" : SKILL_COLORS[skill.id],
                    }}
                  />
                )}

                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                      style={{ backgroundColor: `${SKILL_COLORS[skill.id]}15` }}
                    >
                      {SKILL_ICONS[skill.id]}
                    </span>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-800">{SKILL_LABELS[skill.id]}</span>
                      {avg > 0 && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-gray-500">ปัจจุบัน {avg.toFixed(1)}</span>
                          <span className={`text-xs font-medium ${diff <= 0 ? "text-green-500" : diff <= 1 ? "text-yellow-500" : "text-red-400"}`}>
                            ({diff <= 0 ? "ถึงเป้าแล้ว" : `ขาดอีก ${diff.toFixed(1)}`})
                          </span>
                        </div>
                      )}
                      {avg === 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">ยังไม่มีคะแนน</p>
                      )}
                    </div>
                  </div>

                  {/* Target picker */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">Target:</span>
                    <div className="flex gap-1 flex-wrap">
                      {TARGET_OPTIONS.map((b) => (
                        <button
                          key={b}
                          onClick={() => handleTargetChange(skill.id, String(b))}
                          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                            skill.targetBand === b
                              ? "text-white shadow-sm"
                              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                          style={
                            skill.targetBand === b
                              ? { backgroundColor: SKILL_COLORS[skill.id], borderColor: SKILL_COLORS[skill.id] }
                              : {}
                          }
                        >
                          {b}.0
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gap analysis summary */}
      {skills.some((s) => currentBand[s.id] > 0) && (
        <div className="bg-white/85 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-gray-100/80">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">ภาพรวม Gap Analysis</h3>
          <div className="space-y-2.5">
            {skills.map((skill) => {
              const avg = currentBand[skill.id];
              if (avg === 0) return null;
              const gap = skill.targetBand - avg;
              const pct = Math.min(100, (avg / skill.targetBand) * 100);
              return (
                <div key={skill.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                      <span>{SKILL_ICONS[skill.id]}</span>
                      {SKILL_LABELS[skill.id]}
                    </span>
                    <span className="text-xs text-gray-400 tabular-nums">
                      {avg.toFixed(1)} / {skill.targetBand}.0
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: gap <= 0
                          ? "linear-gradient(90deg, #34C759, #30D158)"
                          : `linear-gradient(90deg, ${SKILL_COLORS[skill.id]}, ${SKILL_COLORS[skill.id]}88)`,
                      }}
                    />
                  </div>
                  {gap > 0 && (
                    <p className="text-[10px] text-gray-400 mt-0.5">Gap: {gap.toFixed(1)}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* About */}
      <div className="bg-white/85 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-gray-100/80">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">เกี่ยวกับ</h3>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm shrink-0">
            <span className="text-2xl font-bold text-white">L</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-800">LexiQ</p>
            <p className="text-xs text-gray-400">v1.0</p>
            <p className="text-xs text-gray-400">ติดตามผลการเรียน IELTS</p>
            <p className="text-xs text-gray-400 mt-2">สร้างด้วย Tauri + React</p>
            <p className="text-xs text-gray-400">ข้อมูลทั้งหมดถูกเก็บในเครื่องของคุณเท่านั้น</p>
          </div>
        </div>
      </div>
    </div>
  );
}
