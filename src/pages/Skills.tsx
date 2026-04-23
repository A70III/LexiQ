import { useMemo, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { SKILL_LABELS } from "../types";
import { SKILL_ICONS } from "../types/icons";
import BandBadge from "../components/BandBadge";
import ProgressBar from "../components/ProgressBar";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const SKILL_COLORS: Record<string, string> = {
  listening: "#007AFF",
  reading: "#34C759",
  writing: "#FF9500",
  speaking: "#FF2D55",
};

export default function Skills() {
  const { skills, courses, scores } = useAppStore();
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const skillStats = useMemo(() => {
    return skills.map((skill) => {
      const skillScores = scores.filter((s) => s.skillId === skill.id).sort((a, b) => a.date.localeCompare(b.date));
      const latestBand = skillScores.length > 0 ? skillScores[skillScores.length - 1].band : 0;
      const avgBand =
        skillScores.length > 0
          ? skillScores.reduce((sum, s) => sum + s.band, 0) / skillScores.length
          : 0;
      const skillCourses = courses.filter((c) => c.skillId === skill.id);
      const completedLessons = skillCourses.reduce((sum, c) => sum + c.completedLessons, 0);
      const totalLessons = skillCourses.reduce((sum, c) => sum + c.totalLessons, 0);
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      const chartData = skillScores.map((s) => ({ date: s.date.slice(5), band: s.band }));

      return { ...skill, latestBand, avgBand, skillCourses, progress, chartData };
    });
  }, [skills, courses, scores]);

  const targetPct = (current: number, target: number) => Math.min(100, (current / target) * 100);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Skills</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skillStats.map((skill) => {
          const isExpanded = expandedSkill === skill.id;
          const progressRingPct = targetPct(skill.latestBand, skill.targetBand);

          return (
            <div
              key={skill.id}
              className="bg-white/85 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/80 overflow-hidden card-hover"
            >
              {/* Gradient header */}
              <div
                className="px-4 py-3.5 flex items-center gap-3 cursor-pointer select-none"
                style={{ background: `linear-gradient(135deg, ${SKILL_COLORS[skill.id]}12, ${SKILL_COLORS[skill.id]}06)` }}
                onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
              >
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${SKILL_COLORS[skill.id]}18` }}
                >
                  {SKILL_ICONS[skill.id]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{SKILL_LABELS[skill.id]}</span>
                    {skill.latestBand > 0 && <BandBadge band={skill.latestBand} size="sm" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">
                      {skill.latestBand > 0 ? `เฉลี่ย ${skill.avgBand.toFixed(1)}` : "ยังไม่มีคะแนน"}
                    </span>
<span className="text-[10px] text-purple-500 font-medium bg-purple-50 px-1.5 py-0.5 rounded">
                       Target {Number.isInteger(skill.targetBand) ? `${skill.targetBand}.0` : skill.targetBand}
                     </span>
                  </div>
                </div>
                {/* Mini progress ring indicator */}
                {skill.latestBand > 0 && (
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="17" fill="none" stroke="#e8ecf0" strokeWidth="3" />
                      <circle
                        cx="20" cy="20" r="17" fill="none"
                        stroke={SKILL_COLORS[skill.id]}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${(progressRingPct / 100) * 106.8} 106.8`}
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold" style={{ color: SKILL_COLORS[skill.id] }}>
                      {Math.round(progressRingPct)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div className="px-4 py-2.5 flex items-center gap-4 bg-gray-50/40 border-y border-gray-50">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400">Courses</span>
                  <span className="text-xs font-semibold text-gray-700">{skill.skillCourses.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400">Progress</span>
                  <span className="text-xs font-semibold text-gray-700">{skill.progress}%</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[10px] text-gray-400">
                    {skill.latestBand > 0
                      ? `Gap: ${(skill.targetBand - skill.latestBand).toFixed(1)}`
                      : `Target: ${Number.isInteger(skill.targetBand) ? `${skill.targetBand}.0` : skill.targetBand}`}
                  </span>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="p-4 space-y-3">
                  {/* Mini chart */}
                  {skill.chartData.length > 1 ? (
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={skill.chartData}>
                          <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#aaa" }} />
                          <YAxis domain={[0, 9]} hide />
                          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e8ecf0" }} />
                          <Line
                            type="monotone"
                            dataKey="band"
                            stroke={SKILL_COLORS[skill.id]}
                            strokeWidth={2}
                            dot={{ r: 2, fill: SKILL_COLORS[skill.id] }}
                            activeDot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : skill.chartData.length === 1 ? (
                    <p className="text-xs text-gray-400 text-center py-4">มีคะแนน 1 ครั้ง เพิ่มคะแนนเพื่อดูแนวโน้ม</p>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">ยังไม่มีข้อมูลคะแนน</p>
                  )}

                  {/* Linked courses */}
                  {skill.skillCourses.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Courses ใน skill นี้</p>
                      <div className="space-y-1.5">
                        {skill.skillCourses.map((c) => {
                          const pct = c.totalLessons > 0 ? Math.round((c.completedLessons / c.totalLessons) * 100) : 0;
                          return (
                            <div key={c.id} className="flex items-center gap-2 text-xs">
                              <span className="flex-1 truncate text-gray-600">{c.title}</span>
                              <span className="text-gray-400 tabular-nums">{c.completedLessons}/{c.totalLessons}</span>
                              <div className="w-16">
                                <ProgressBar value={pct} color={SKILL_COLORS[skill.id]} size="sm" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
