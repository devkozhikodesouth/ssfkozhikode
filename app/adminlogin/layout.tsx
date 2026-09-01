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
  UserCheck,
  Shield,
  Layers,
  BarChart3,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAttendanceMode } from "@/app/utils/useAttendanceMode";

type NavItemConfig = {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

/* ─────────────────────────────
   MENU CONFIG WITH ICONS
────────────────────────────── */
const MENU = [
  {
    id: "gc26",
    label: "Grand Conclave 26",
    subtitle: "Management Suite",
    icon: Sparkles,
    badge: "Active",
    items: [
      {
        name: "Total Delegates",
        path: "/adminlogin/gc26/totaldelegates",
        icon: BarChart3,
      },
      {
        name: "Division Delegates",
        path: "/adminlogin/gc26/division",
        icon: Building2,
      },
      {
        name: "Sector Delegates",
        path: "/adminlogin/gc26/sector",
        icon: Layers,
      },
      {
        name: "District Delegates",
        path: "/adminlogin/gc26/district",
        icon: Shield,
      },
      {
        name: "Mark Attendance",
        path: "/adminlogin/gc26/attendance",
        icon: UserCheck,
      },
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
  const [openGroup, setOpenGroup] = useState<string | null>("gc26");

  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    router.push("/adminlogin/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-100/90 text-slate-800 pb-16 md:pb-0 font-sans selection:bg-purple-500 selection:text-white">
      {/* ───────── Desktop Sidebar ───────── */}
      <motion.aside
        animate={{ width: sidebarOpen ? 280 : 88 }}
        transition={{ type: "spring", stiffness: 140, damping: 22 }}
        className="hidden md:flex flex-col bg-white/95 backdrop-blur-xl border-r border-slate-200/80 shadow-sm z-30 sticky top-0 h-screen overflow-y-auto shrink-0"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Monogram Logo */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-600/25 ring-2 ring-white">
                S
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            {sidebarOpen && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-extrabold text-sm text-slate-900 tracking-tight truncate">
                    <span className="font-cooper text-purple-700">SSF</span> Admin
                  </p>
                  <span className="px-1.5 py-0.2 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black uppercase tracking-wider">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold truncate">
                  Kozhikode South
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-slate-800 hover:bg-slate-100 p-1.5 rounded-xl transition cursor-pointer"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {MENU.map((group) => (
            <div key={group.id} className="space-y-1.5">
              {/* Group Header */}
              {sidebarOpen ? (
                <div className="px-3 py-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <group.icon className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      {group.label}
                    </span>
                  </div>
                  {group.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black">
                      {group.badge}
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-full flex justify-center py-1">
                  <span className="w-6 h-0.5 bg-slate-200 rounded-full" />
                </div>
              )}

              {/* Group Items */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.path;
                  const IconComponent = item.icon;

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => router.push(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group relative ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      }`}
                      title={!sidebarOpen ? item.name : undefined}
                    >
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <motion.span
                          layoutId="activePill"
                          className="absolute -left-1.5 top-2.5 bottom-2.5 w-1 rounded-full bg-purple-600"
                        />
                      )}

                      <div
                        className={`p-1 rounded-lg transition ${
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-purple-600"
                        }`}
                      >
                        <IconComponent className="w-4 h-4 shrink-0" />
                      </div>

                      {sidebarOpen && (
                        <span className="truncate flex-1 text-left">
                          {item.name}
                        </span>
                      )}

                      {sidebarOpen && isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
          {sidebarOpen && (
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
                A
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-slate-800 truncate">
                  Admin Panel
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[10px] text-slate-400 font-semibold truncate">
                    Online • Master
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-600 hover:text-white hover:border-red-600 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95`}
            title="Logout from admin panel"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
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
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white/98 backdrop-blur-xl border-r border-slate-200 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-base shadow-md">
                    S
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-slate-900">
                      <span className="font-cooper text-purple-700">SSF</span> Admin
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Management Dashboard
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Nav Items */}
              <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
                {MENU.map((group) => (
                  <div key={group.id} className="space-y-1.5">
                    <div className="px-2 py-1 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <group.icon className="w-3.5 h-3.5 text-purple-600" />
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                          {group.label}
                        </span>
                      </div>
                      {group.badge && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black">
                          {group.badge}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const isActive = pathname === item.path;
                        const IconComponent = item.icon;

                        return (
                          <button
                            key={item.path}
                            type="button"
                            onClick={() => {
                              router.push(item.path);
                              setMobileOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span className="flex-1 text-left">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/60">
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md hover:bg-red-700 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 z-30 flex items-center justify-around px-1 shadow-lg">
        <button
          onClick={() => router.push("/adminlogin/gc26/totaldelegates")}
          className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-bold transition ${
            pathname === "/adminlogin/gc26/totaldelegates"
              ? "text-purple-600"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Total</span>
        </button>

        <button
          onClick={() => router.push("/adminlogin/gc26/division")}
          className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-bold transition ${
            pathname === "/adminlogin/gc26/division"
              ? "text-purple-600"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Division</span>
        </button>

        <button
          onClick={() => router.push("/adminlogin/gc26/sector")}
          className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-bold transition ${
            pathname === "/adminlogin/gc26/sector"
              ? "text-purple-600"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Sector</span>
        </button>

        <button
          onClick={() => router.push("/adminlogin/gc26/district")}
          className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-bold transition ${
            pathname === "/adminlogin/gc26/district"
              ? "text-purple-600"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>District</span>
        </button>

        <button
          onClick={() => router.push("/adminlogin/gc26/attendance")}
          className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-bold transition ${
            pathname === "/adminlogin/gc26/attendance"
              ? "text-purple-600"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Attendance</span>
        </button>

        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center justify-center w-full py-1 text-[10px] font-bold text-slate-400 hover:text-slate-700"
        >
          <Menu className="w-4 h-4" />
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
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="md:hidden text-slate-700 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
            Admin Dashboard
          </h1>
          <p className="hidden sm:block text-[11px] font-semibold text-slate-400">
            Grand Conclave 26 Management
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Attendance Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleAttendanceMode}
          className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center gap-2 border shadow-xs active:scale-95 cursor-pointer ${
            attendanceMode
              ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{attendanceMode ? "Attendance Mode: ON" : "Attendance Mode: OFF"}</span>
        </button>

        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs sm:text-sm shadow-md ring-2 ring-white">
          A
        </div>
      </div>
    </header>
  );
}
