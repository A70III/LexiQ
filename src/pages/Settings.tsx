import { useAppStore } from "../store/useAppStore";
import { SKILL_ICONS } from "../types/icons";
import { syncFromMac, syncToMac } from "../lib/sync";

const SKILL_LABELS: Record<string, string> = { listening: "Listening", reading: "Reading", writing: "Writing", speaking: "Speaking" };
const SKILL_COLORS: Record<string, string> = { listening: "#007AFF", reading: "#34C759", writing: "#FF9500", speaking: "#FF2D55" };

const TARGET_OPTIONS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

export default function Settings() {
  const { skills, scores, updateSkillTarget, serverAddress, setServerAddress, lastSyncDate, offline, resetAll } = useAppStore();

  const currentBand: Record<string, number> = {};
  for (const s of skills) {
    const skillScores = scores.filter((sc) => sc.skillId === s.id);
    currentBand[s.id] = skillScores.length > 0 
      ? skillScores.reduce((sum, sc) => sum + sc.band, 0) / skillScores.length 
      : 0;
  }

  const handleTargetChange = (skillId: string, val: string) => {
    const band = parseFloat(val);
    if (band >= 1 && band <= 9) updateSkillTarget(skillId, band);
  }

  const handleSyncFromMac = async () => {
    if (!serverAddress) return;
    try {
      await syncFromMac();
    } catch (e) {
      console.error("Sync error:", e);
    }
  }

  const handleSyncToMac = async () => {
    if (!serverAddress) return;
    try {
      await syncToMac();
    } catch (e) {
      console.error("Sync error:", e);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-safe">
      <div className="p-4 space-y-5">
        <h1 className="text-xl font-bold text-slate-800 px-1">Settings</h1>

        {/* Sync Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-800">Sync with Mac</h2>
          
          <div>
            <label className="text-xs text-slate-500 font-medium mb-2 block">Server Address</label>
            <input
              type="text"
              value={serverAddress}
              onChange={(e) => setServerAddress(e.target.value)}
              placeholder="http://192.168.1.5:7878"
              className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none bg-slate-50/80"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSyncFromMac}
              disabled={!serverAddress || offline}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white font-semibold rounded-xl text-sm active:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Sync From Mac
            </button>
            <button
              onClick={handleSyncToMac}
              disabled={!serverAddress || offline}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-semibold rounded-xl text-sm active:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4 4l-4-4m0 0l4-4m-4 4h4" />
              </svg>
              Push To Mac
            </button>
          </div>

          {offline && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-600 rounded-lg text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4 4 0 01-5.523-5.523m7.072 7.072l2.829 2.829" />
              </svg>
              Working offline
            </div>
          )}

          {lastSyncDate && (
            <p className="text-xs text-slate-400 text-center">Last sync: {new Date(lastSyncDate).toLocaleString('th-TH')}</p>
          )}
        </div>

        {/* Target Band */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Target Band</h2>
            <p className="text-xs text-slate-400 mt-1">Set your goal for each skill</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {skills.map((skill) => {
              const avg = currentBand[skill.id] || 0;
              const diff = skill.targetBand - avg;
              
              return (
                <div 
                  key={skill.id} 
                  className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50"
                  style={{ borderLeft: `4px solid ${SKILL_COLORS[skill.id]}` }}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${SKILL_COLORS[skill.id]}20` }}
                      >
                        {SKILL_ICONS[skill.id]}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-slate-800">{SKILL_LABELS[skill.id]}</span>
                        {avg > 0 && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500">Current: {avg.toFixed(1)}</span>
                            <span className={`text-xs font-medium ${diff <= 0 ? 'text-green-500' : diff <= 1 ? 'text-yellow-500' : 'text-red-400'}`}>
                              ({diff <= 0 ? 'At target' : `Gap ${diff.toFixed(1)}`})
                            </span>
                          </div>
                        )}
                        {avg === 0 && (
                          <p className="text-xs text-slate-400 mt-0.5">No scores yet</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium shrink-0">Target:</span>
                      <div className="flex gap-1 flex-wrap">
                        {TARGET_OPTIONS.map((b) => (
                          <button
                            key={b}
                            onClick={() => handleTargetChange(skill.id, String(b))}
                            className={`min-w-[44px] h-8 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                              skill.targetBand === b
                                ? 'text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-200 border border-slate-200'
                            }`}
                            style={skill.targetBand === b ? { backgroundColor: SKILL_COLORS[skill.id] } : {}}
                          >
                            {Number.isInteger(b) ? `${b}.0` : b}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Reset */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <button
            onClick={async () => {
              if (confirm('ลบข้อมูลทั้งหมด?')) {
                await resetAll();
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 font-semibold rounded-xl text-sm hover:bg-red-100 active:bg-red-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Reset All Data
          </button>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm shrink-0">
              <span className="text-2xl font-bold text-white">L</span>
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-800">LexiQ</p>
              <p className="text-xs text-slate-400">v1.1 (PWA - Offline First)</p>
              <p className="text-xs text-slate-400">IELTS Score Tracker</p>
              <p className="text-xs text-slate-400 mt-2">Built with React + Dexie + IndexedDB</p>
              <p className="text-xs text-slate-400">Data stored securely on device</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}