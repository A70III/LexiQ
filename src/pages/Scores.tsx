import { useState, useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { SKILL_LABELS } from "../types";
import { SKILL_ICONS } from "../types/icons";
import BandBadge from "../components/BandBadge";
import EmptyState from "../components/EmptyState";
import { HiOutlineTrophy, HiOutlineMagnifyingGlass } from "react-icons/hi2";

const SKILL_ORDER = ["listening", "reading", "writing", "speaking"];

const BAND_GRADES = [
  { min: 0, max: 4, label: "Low", color: "#FF3B30" },
  { min: 4, max: 5.5, label: "Mid", color: "#FF9500" },
  { min: 5.5, max: 7, label: "Good", color: "#34C759" },
  { min: 7, max: 9.1, label: "Excellent", color: "#007AFF" },
];

const bandGrade = (band: number) => BAND_GRADES.find((g) => band >= g.min && band < g.max) || BAND_GRADES[0];

interface ScoreForm {
  skillId: string;
  band: string;
  date: string;
  testName: string;
}

const emptyForm = (): ScoreForm => ({
  skillId: "listening",
  band: "",
  date: new Date().toISOString().split("T")[0],
  testName: "",
});

export default function Scores() {
  const { scores, addScore, removeScore } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ScoreForm>(emptyForm());
  const [filterSkill, setFilterSkill] = useState<string>("all");

  const handleSubmit = () => {
    const band = parseFloat(form.band);
    if (isNaN(band) || band < 0 || band > 9) return;
    addScore({ skillId: form.skillId, band, date: form.date, testName: form.testName || undefined });
    setForm(emptyForm());
    setShowForm(false);
  };

  const handleCancel = () => {
    setForm(emptyForm());
    setShowForm(false);
  };

  const filteredScores = useMemo(() => {
    let list = [...scores];
    if (filterSkill !== "all") list = list.filter((s) => s.skillId === filterSkill);
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [scores, filterSkill]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Scores</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          + Add Score
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white/85 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-gray-100/80 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">บันทึกคะแนน</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">Skill</label>
              <select
                value={form.skillId}
                onChange={(e) => setForm({ ...form, skillId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white/80"
              >
                {SKILL_ORDER.map((s) => <option key={s} value={s}>{SKILL_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">Band Score (0-9)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="9"
                value={form.band}
                onChange={(e) => setForm({ ...form, band: e.target.value })}
                placeholder="7.0"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white/80"
              />
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
            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">ชื่อ Test (ไม่บังคับ)</label>
              <input
                value={form.testName}
                onChange={(e) => setForm({ ...form, testName: e.target.value })}
                placeholder="Mock Test 1"
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

      {/* Filter — Segmented control style */}
      {scores.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100/80 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setFilterSkill("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                filterSkill === "all"
                  ? "bg-white text-gray-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All
            </button>
            {SKILL_ORDER.map((s) => (
              <button
                key={s}
                onClick={() => setFilterSkill(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  filterSkill === s
                    ? "bg-white text-gray-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {SKILL_LABELS[s]}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filteredScores.length} records</span>
        </div>
      )}

      {/* Score list */}
      {filteredScores.length === 0 ? (
        scores.length === 0 ? (
          <EmptyState
            icon={<HiOutlineTrophy className="w-10 h-10" />}
            title="ยังไม่มีคะแนน"
            subtitle="บันทึกคะแนนสอบของคุณเพื่อดูแนวโน้มและความคืบหน้า"
            action={{ label: "เพิ่มคะแนน", onClick: () => setShowForm(true) }}
          />
        ) : (
          <EmptyState icon={<HiOutlineMagnifyingGlass className="w-10 h-10" />} title="ไม่มีคะแนนที่ตรงกับ filter นี้" />
        )
      ) : (
        <div className="bg-white/85 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/80 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">วันที่</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">Skill</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">Test</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-400">Band</th>
                <th className="w-10 px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filteredScores.map((s, i) => {
                const grade = bandGrade(s.band);
                return (
                  <tr
                    key={s.id}
                    className={`border-b border-gray-50 transition-colors ${
                      i % 2 === 0 ? "bg-transparent" : "bg-gray-50/30"
                    } hover:bg-gray-50/60`}
                    style={{ borderLeft: `3px solid ${grade.color}` }}
                  >
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{s.date}</td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5">
                        <span>{SKILL_ICONS[s.skillId]}</span>
                        <span className="text-gray-700">{SKILL_LABELS[s.skillId]}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{s.testName || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-2.5 text-right">
                      <BandBadge band={s.band} size="sm" />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => removeScore(s.id)}
                        className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded text-xs transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
