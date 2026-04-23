import { Outlet } from "react-router-dom";
import MobileNav from "./MobileNav";

export default function Layout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Mobile Nav (visible on all screens, but bottom nav only on mobile) */}
      <MobileNav />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-14 pb-16 md:pt-0 md:pb-0 md:pl-60">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}