import { useState } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlineChartBarSquare, HiOutlineBookOpen, HiOutlinePencilSquare, HiOutlineTrophy, HiOutlineCalendar, HiOutlineCog6Tooth, HiXMark, HiBars3 } from "react-icons/hi2";

const navItems = [
  { to: "/", icon: HiOutlineChartBarSquare, label: "Dashboard" },
  { to: "/skills", icon: HiOutlineBookOpen, label: "Skills" },
  { to: "/courses", icon: HiOutlinePencilSquare, label: "Courses" },
  { to: "/scores", icon: HiOutlineTrophy, label: "Scores" },
  { to: "/schedule", icon: HiOutlineCalendar, label: "Schedule" },
  { to: "/settings", icon: HiOutlineCog6Tooth, label: "Settings" },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 safe-area-top">
        <div className="flex items-center justify-between px-4 h-14">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2"
          >
            <HiBars3 className="w-6 h-6 text-slate-700" />
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LexiQ
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-100 safe-area-bottom">
        <nav className="flex justify-around h-16">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 ${
                  isActive ? "text-blue-500" : "text-slate-400"
                }`
              }
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile Drawer/Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/30 z-40"
            onClick={closeMenu}
          />
          
          {/* Drawer */}
          <div className="md:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-50 animate-slide-in">
            <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LexiQ
              </h1>
              <button 
                onClick={closeMenu}
                className="p-2 -mr-2"
              >
                <HiXMark className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:flex w-60 h-screen bg-white/80 backdrop-blur-xl border-r border-gray-200/80 flex-col select-none">
        <div className="px-6 py-6 border-b border-gray-100">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LexiQ
          </h1>
          <p className="text-[11px] text-gray-400 mt-1 font-medium">ติดตามผลการเรียน IELTS</p>
        </div>
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
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <item.icon className="w-4 h-4" />
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}