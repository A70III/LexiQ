import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAppStore } from "./store/useAppStore";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Skills from "./pages/Skills";
import Courses from "./pages/Courses";
import Scores from "./pages/Scores";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";

function LoadingScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#f5f5f7]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">กำลังโหลด...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { isLoaded, isLoading, error, loadData } = useAppStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-center">
          <p className="text-red-500 text-sm mb-2">⚠️ {error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm cursor-pointer"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="skills" element={<Skills />} />
        <Route path="courses" element={<Courses />} />
        <Route path="scores" element={<Scores />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
