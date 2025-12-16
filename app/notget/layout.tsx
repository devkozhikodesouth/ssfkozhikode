"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
type NavGroupProps = {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: { name: string; path: string }[];
  open: boolean;
  onToggle: () => void;
  expanded: boolean;
  pathname: string;
};

/* ─────────────────────────────
   MENU CONFIG
────────────────────────────── */
const MENU = [
  {
    id: "students-gala",
    label: "Students Gala",
    icon: "🎓",
    items: [
      { name: "Division Wise Data", path: "/notget/gala/division" },
      { name: "Sector Wise Data", path: "/notget/gala/sector" },
      { name: "Unit Wise Data", path: "/notget/gala/unit" },
      { name: "Students List", path: "/notget/gala/students" },
      { name: "Mark Attendance", path: "/notget/gala/markattendance" },
      { name: "Attendance List", path: "/notget/gala/attendancelist" },
    ],
  },
  {
    id: "grand-conclave",
    label: "Grand Conclave",
    icon: "🏛️",
    items: [
      { name: "Division Delegates", path: "/notget/grand/division" },
      { name: "Sector Delegates", path: "/notget/grand/sector" },
      { name: "All Delegates", path: "/notget/grand/delegates" },
      { name: "Mark Attendance", path: "/notget/grand/attendance" },
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

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    router.push("/notget/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
      {/* ───────── Desktop Sidebar ───────── */}
      <motion.aside
        animate={{ width: sidebarOpen ? 280 : 84 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="hidden md:flex flex-col bg-white border-r shadow-sm"
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              S
            </div>
            {sidebarOpen && (
              <div>
                <p className="font-semibold leading-tight">SSF Admin</p>
                <p className="text-xs text-gray-500">Management Panel</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-800"
          >
            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
{MENU.map((group) => (
  <NavGroup
    key={group.id}              // ✅ React key
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
        <div className="px-4 py-4 border-t">
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </motion.aside>

      {/* ───────── Mobile Sidebar ───────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 z-40 w-72 bg-white border-r"
            >
              <div className="px-5 py-4 border-b font-semibold">
                SSF Admin
              </div>
              <nav className="px-4 py-4 space-y-3">
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
                  />
                ))}
              </nav>
            </motion.aside>

            <div
              className="fixed inset-0 bg-black/40 z-30"
              onClick={() => setMobileOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* ───────── Main Content ───────── */}
      <div className="flex-1 flex flex-col">
        <Navbar onMenu={() => setMobileOpen((p) => !p)} />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   Navbar
────────────────────────────── */
function Navbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="md:hidden text-gray-600">
          <Menu />
        </button>
        <h1 className="text-xl font-semibold tracking-tight">
          Admin Dashboard
        </h1>
      </div>

      <div className="hidden sm:flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search..."
            className="pl-9 pr-4 py-2 text-sm rounded-lg border bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
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
}: NavGroupProps) {
  const router = useRouter();

  return (
    <div>
      <button
        onClick={onToggle}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition ${open
          ? "bg-indigo-50 text-indigo-700"
          : "hover:bg-slate-100"
          }`}
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          {expanded && <span>{label}</span>}
        </div>
        {expanded && (
          <ChevronRight
            className={`w-4 h-4 transition-transform ${open ? "rotate-90" : ""
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
            className="ml-6 mt-2 space-y-1"
          >
            {items.map((item: any) => (
              <div
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`px-2 py-1.5 rounded-md text-sm cursor-pointer transition ${pathname === item.path
                  ? "bg-indigo-100 text-indigo-700 font-semibold"
                  : "text-gray-600 hover:text-indigo-600"
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
