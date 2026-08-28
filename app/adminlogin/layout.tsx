"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  GraduationCap,
  Building2,
  X,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAttendanceMode } from "@/app/utils/useAttendanceMode";

type NavGroupProps = {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: { name: string; path: string }[];
  open: boolean;
  onToggle: () => void;
  expanded: boolean;
  pathname: string;
  onNavigate?: () => void;
};

/* ─────────────────────────────
   MENU CONFIG
────────────────────────────── */
const MENU = [
  {
    id: "grand-gathering",
    label: "Grand Conclave 26",
    icon: "✨",
    items: [
      { name: "Total Delegates", path: "/adminlogin/gg/totaldelegates" },
      { name: "Division Delegates", path: "/adminlogin/gg/division" },
      { name: "Sector Delegates", path: "/adminlogin/gg/sector" },
      { name: "Mark Attendance", path: "/adminlogin/gg/attendance" },
    ],
  },
  {
    id: "grand-conclave",
    label: "Grand Conclave",
    icon: "🏛️",
    items: [
      { name: "Total Delegates", path: "/adminlogin/grand/totaldelegates" },
      { name: "Division Delegates", path: "/adminlogin/grand/division" },
      { name: "Sector Delegates", path: "/adminlogin/grand/sector" },
      { name: "Mark Attendance", path: "/adminlogin/grand/attendance" },
    ],
  },
  {
    id: "students-gala",
    label: "Students Gala",
    icon: "🎓",
    items: [
      { name: "Division Wise Data", path: "/adminlogin/gala/division" },
      { name: "Sector Wise Data", path: "/adminlogin/gala/sector" },
      { name: "Unit Wise Data", path: "/adminlogin/gala/unit" },
      { name: "Students List", path: "/adminlogin/gala/studentsdata" },
      { name: "Mark Attendance", path: "/adminlogin/gala/markattendance" },
      { name: "Attendance List", path: "/adminlogin/gala/attendancelist" },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/adminlogin/login" ||
    pathname === "/adminlogin/forgot-password" ||
    pathname === "/adminlogin/reset-password";

  if (isAuthPage) {
    return <>{children}</>;
  }

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>("grand-gathering");

  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    router.push("/adminlogin/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 pb-16 md:pb-0">
      {/* ───────── Desktop Sidebar ───────── */}
      <motion.aside
        animate={{ width: sidebarOpen ? 280 : 84 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="hidden md:flex flex-col bg-white border-r border-slate-200 shadow-sm z-30 sticky top-0 h-screen overflow-y-auto shrink-0"
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold shadow-md">
              S
            </div>
            {sidebarOpen && (
              <div>
                <p className="font-bold leading-tight text-slate-900">SSF Admin</p>
                <p className="text-xs text-slate-500 font-medium">Management Panel</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
          {MENU.map((group) => (
            <NavGroup
              key={group.id}
              {...group}
              open={openGroup === group.id}
              onToggle={() =>
                setOpenGroup(openGroup === group.id ? null : group.id)
              }
              expanded={sidebarOpen}
              pathname={pathname}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </motion.aside>

      {/* ───────── Mobile Sidebar Drawer ───────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r shadow-2xl flex flex-col"
            >
              <div className="px-5 py-4 border-b flex justify-between items-center font-bold text-slate-900">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    S
                  </div>
                  <span>SSF Admin Panel</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
                {MENU.map((group) => (
                  <NavGroup
                    key={group.id}
                    {...group}
                    open={openGroup === group.id}
                    onToggle={() =>
                      setOpenGroup(openGroup === group.id ? null : group.id)
                    }
                    expanded
                    pathname={pathname}
                    onNavigate={() => setMobileOpen(false)}
                  />
                ))}
              </nav>

              <div className="p-4 border-t">
                <button
                  onClick={logout}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-600 text-white text-sm font-bold shadow-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* ───────── Main Content ───────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenu={() => setMobileOpen((p) => !p)} />
        <main className="flex-1 p-3 sm:p-6 md:p-8 overflow-x-hidden">{children}</main>
      </div>

      {/* ───────── Mobile Bottom Navigation Bar ───────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-slate-200 z-30 flex items-center justify-around px-2 shadow-lg">
        <button
          onClick={() => router.push("/adminlogin/gg/totaldelegates")}
          className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-bold ${
            pathname.includes("/adminlogin/gg")
              ? "text-purple-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Gathering</span>
        </button>

        <button
          onClick={() => router.push("/adminlogin/grand/totaldelegates")}
          className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-bold ${
            pathname.includes("/adminlogin/grand")
              ? "text-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span>Conclave</span>
        </button>

        <button
          onClick={() => router.push("/adminlogin/gala/division")}
          className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-bold ${
            pathname.includes("/adminlogin/gala")
              ? "text-emerald-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span>Gala</span>
        </button>

        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center justify-center w-full py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800"
        >
          <Menu className="w-5 h-5" />
          <span>Menu</span>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   Navbar with Attendance Toggle
────────────────────────────── */
function Navbar({ onMenu }: { onMenu: () => void }) {
  const { attendanceMode, toggleAttendanceMode } = useAttendanceMode();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="md:hidden text-slate-700 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
          Admin Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Centralized Attendance Mode Toggle Button in Admin Navbar */}
        <button
          type="button"
          onClick={toggleAttendanceMode}
          className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center gap-2 border shadow-sm active:scale-95 ${
            attendanceMode
              ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
              : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{attendanceMode ? "Attendance Mode: ON" : "Attendance Mode: OFF"}</span>
        </button>

        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md">
          A
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────
   NavGroup
────────────────────────────── */
function NavGroup({
  label,
  icon,
  items,
  open,
  onToggle,
  expanded,
  pathname,
  onNavigate,
}: NavGroupProps) {
  const router = useRouter();

  return (
    <div>
      <button
        onClick={onToggle}
        className={`flex items-center justify-between w-full px-3 py-3 rounded-xl text-sm font-bold transition ${
          open
            ? "bg-indigo-50 text-indigo-700"
            : "hover:bg-slate-100 text-slate-700"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">{icon}</span>
          {expanded && <span>{label}</span>}
        </div>
        {expanded && (
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-200 ${
              open ? "rotate-90 text-indigo-600" : "text-slate-400"
            }`}
          />
        )}
      </button>

      <AnimatePresence>
        {open && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-4 mt-1.5 space-y-1 border-l-2 border-indigo-100 pl-3"
          >
            {items.map((item: any) => (
              <div
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  if (onNavigate) onNavigate();
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  pathname === item.path
                    ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
                }`}
              >
                {item.name}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
