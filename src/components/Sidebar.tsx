import { NavLink } from "react-router-dom";
import { HiOutlineChartBarSquare, HiOutlineBookOpen, HiOutlinePencilSquare, HiOutlineTrophy, HiOutlineCalendar, HiOutlineCog6Tooth } from "react-icons/hi2";
import SyncStatus from "./SyncStatus";

const navItems = [
  { to: "/", icon: HiOutlineChartBarSquare, label: "Dashboard" },
  { to: "/skills", icon: HiOutlineBookOpen, label: "Skills" },
  { to: "/courses", icon: HiOutlinePencilSquare, label: "Courses" },
  { to: "/scores", icon: HiOutlineTrophy, label: "Scores" },
  { to: "/schedule", icon: HiOutlineCalendar, label: "Schedule" },
  { to: "/settings", icon: HiOutlineCog6Tooth, label: "Settings" },
];

export default function Sidebar() {
  return (
    <div className="w-60 h-screen bg-white/80 backdrop-blur-xl border-r border-gray-200/80 flex flex-col select-none">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-100">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          LexiQ
        </h1>
        <p className="text-[11px] text-gray-400 mt-1 font-medium">ติดตามผลการเรียน IELTS</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100/70 hover:text-gray-700"
              }`
            }
          >
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <item.icon className="w-4 h-4" />
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto">
        <SyncStatus />
      </div>
    </div>
  );
}
