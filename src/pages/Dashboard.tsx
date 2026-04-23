import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { SKILL_LABELS } from "../types";
import { SKILL_ICONS } from "../types/icons";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";
import EmptyState from "../components/EmptyState";
import { HiOutlineChartBarSquare } from "react-icons/hi2";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const skillsList = ["listening", "reading", "writing", "speaking"];
const SKILL_COLORS: Record<string, string> = {
  listening: "#007AFF",
  reading: "#34C759",
  writing: "#FF9500",
  speaking: "#FF2D55",
};

export default function Dashboard() {
  const { courses, scores } = useAppStore();

  const latestScores = useMemo(() => {
    const map: Record<string, number> = {};
    for (const skillId of skillsList) {
      const skillScores = scores.filter((s) => s.skillId === skillId).sort((a, b) => b.date.localeCompare(a.date));
      map[skillId] = skillScores[0]?.band ?? 0;
    }
    return map;
  }, [scores]);

  const averageScore = useMemo(() => {
    if (scores.length === 0) return 0;
    return scores.reduce((sum, s) => sum + s.band, 0) / scores.length;
  }, [scores]);

  const totalCourses = courses.length;
  const completedCourses = courses.filter((c) => c.completedLessons === c.totalLessons).length;
  const overallProgress = totalCourses > 0 ? Math.round(courses.reduce((sum, c) => sum + (c.totalLessons > 0 ? (c.completedLessons / c.totalLessons) * 100 : 0), 0) / totalCourses) : 0;

  // Band trend chart data
  const trendData = useMemo(() => {
    const dateMap: Record<string, Record<string, number>> = {};
    for (const score of scores) {
      if (!dateMap[score.date]) dateMap[score.date] = {};
      dateMap[score.date][score.skillId] = score.band;
    }
    return Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({
        date: date.slice(5),
        ...vals,
      }));
  }, [scores]);

  // Course progress chart data
  const courseChartData = useMemo(() => {
    return courses.map((c) => ({
      name: c.title.length > 15 ? c.title.slice(0, 15) + "..." : c.title,
      progress: c.totalLessons > 0 ? Math.round((c.completedLessons / c.totalLessons) * 100) : 0,
      fill: SKILL_COLORS[c.skillId] || "#999",
    }));
  }, [courses]);

  if (scores.length === 0 && courses.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Dashboard</h2>
        <EmptyState
          icon={<HiOutlineChartBarSquare className="w-10 h-10" />}
          title="ยินดีต้อนรับสู่ LexiQ!"
          subtitle="เริ่มต้นด้วยการเพิ่ม Course หรือบันทึกคะแนนสอบของคุณ"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.href = "/courses"}
            className="px-3 py-1.5 text-xs font-medium bg-white/80 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            + เพิ่ม Course
          </button>
          <button
            onClick={() => window.location.href = "/scores"}
            className="px-3 py-1.5 text-xs font-medium bg-white/80 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            + บันทึกคะแนน
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {skillsList.map((skillId) => (
          <StatCard
            key={skillId}
            title={SKILL_LABELS[skillId]}
            value={latestScores[skillId] > 0 ? latestScores[skillId].toFixed(1) : "-"}
            subtitle={latestScores[skillId] > 0 ? "" : "ยังไม่มีคะแนน"}
            icon={SKILL_ICONS[skillId]}
            color={SKILL_COLORS[skillId]}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <StatCard title="Avg Band" value={averageScore > 0 ? averageScore.toFixed(1) : "-"} subtitle="คะแนนเฉลี่ยทั้งหมด" color="#5856D6" />
        <StatCard title="Courses" value={`${totalCourses}`} subtitle={completedCourses > 0 ? `สำเร็จ ${completedCourses} คอร์ส` : "ทั้งหมด"} color="#5856D6" />
        <StatCard title="Progress" value={`${overallProgress}%`} subtitle="ความคืบหน้าโดยรวม" color="#5856D6" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Band Trend */}
        <div className="bg-white/85 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100/80">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">แนวโน้มคะแนน (Band Trend)</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#888" }} />
                <YAxis domain={[0, 9]} ticks={[0, 3, 5, 7, 9]} tick={{ fontSize: 10, fill: "#888" }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e8ecf0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {skillsList.map((s) => (
                  <Line
                    key={s}
                    type="monotone"
                    dataKey={s}
                    name={SKILL_LABELS[s]}
                    stroke={SKILL_COLORS[s]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: SKILL_COLORS[s], strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">ยังไม่มีข้อมูลคะแนน</p>
          )}
        </div>

        {/* Course Progress */}
        <div className="bg-white/85 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100/80">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">ความคืบหน้า Course</h3>
          {courseChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={courseChartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#888" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#888" }} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e8ecf0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} />
                <Bar dataKey="progress" name="Progress %" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">ยังไม่มี Course</p>
          )}
        </div>
      </div>

      {/* Recent courses */}
      {courses.length > 0 && (
        <div className="bg-white/85 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100/80">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Courses ล่าสุด</h3>
          <div className="space-y-2">
            {courses.slice(0, 5).map((c, i) => {
              const pct = c.totalLessons > 0 ? Math.round((c.completedLessons / c.totalLessons) * 100) : 0;
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-3 text-sm fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ backgroundColor: `${SKILL_COLORS[c.skillId]}12` }}
                  >
                    {SKILL_ICONS[c.skillId]}
                  </span>
                  <span className="flex-1 truncate text-gray-700 font-medium">{c.title}</span>
                  <span className="text-xs text-gray-400 w-16 text-right tabular-nums">{c.completedLessons}/{c.totalLessons}</span>
                  <div className="w-28">
                    <ProgressBar value={pct} color={SKILL_COLORS[c.skillId]} size="sm" />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right tabular-nums font-medium">{pct}%</span>
                </div>
              );
            })}
          </div>
          {courses.length > 5 && (
            <p className="text-xs text-gray-400 text-center mt-3">+{courses.length - 5} courses เพิ่มเติม</p>
          )}
        </div>
      )}
    </div>
  );
}
