"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Menu, ChevronRight, LogOut, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState("Students Gala");

  const router = useRouter();
  const pathname = usePathname();

  const toggleMenu = (label: string) => {
    setOpenMenu(openMenu === label ? "" : label);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex min-h-screen min-w-screen bg-gray-100 text-gray-900 transition-colors duration-300">
      {/* ─── Desktop Sidebar ───────────────────────── */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="hidden md:flex flex-col border-r h-screen sticky top-0 z-30 bg-white border-gray-200 shadow-sm"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-500" />
            {sidebarOpen && (
              <span className="font-bold text-lg">SSF Admin</span>
            )}
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 text-gray-600 hover:text-gray-900 transition"
          >
            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {sidebarOpen && (
            <p className="text-xs font-semibold uppercase mb-2 text-gray-500">
              Main Menu
            </p>
          )}

          <NavGroup
            label="Students Gala"
            icon="🎓"
            items={[
              { name: "Division Wise Data", path: "/admin/gala/division" },
              { name: "Div Sector Wise Data", path: "/admin/gala/sector" },
              { name: "Div Unit Wise Data", path: "/admin/gala/unit" },
              { name: "Sector Wise Data", path: "/admin/gala/sectorwise" },
              { name: "Students data", path: "/admin/gala/studentsdata" },
              {
                name: "Residential students",
                path: "/admin/gala/residentialstudents",
              },
              { name: "Mark attendance", path: "/admin/gala/markattendance" },
            ]}
            open={openMenu === "Students Gala"}
            onToggle={() => toggleMenu("Students Gala")}
            pathname={pathname}
            expanded={sidebarOpen}
          />

          <NavItem
            label="Calendar"
            icon="📅"
            active={pathname === "/admin/calendar"}
            onClick={() => router.push("/admin/calendar")}
            expanded={sidebarOpen}
          />

          <NavItem
            label="Profile"
            icon="👤"
            active={pathname === "/admin/profile"}
            onClick={() => router.push("/admin/profile")}
            expanded={sidebarOpen}
          />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition"
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </motion.aside>

      {/* ─── Mobile Sidebar ───────────────────────── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r bg-white border-gray-200"
            >
              <div className="p-5 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-2 text-xl font-bold">
                  <div className="w-7 h-7 rounded-full bg-indigo-500" />
                  SSF Admin
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="md:hidden text-gray-600 hover:text-gray-900 transition text-xl"
                >
                  ✖
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                <NavGroup
                  label="Students Gala"
                  icon="🎓"
                  items={[
                    {
                      name: "Division Wise Data",
                      path: "/admin/gala/division",
                    },
                    {
                      name: "Div Sector Wise Data",
                      path: "/admin/gala/sector",
                    },
                    { name: "Div Unit Wise Data", path: "/admin/gala/unit" },
                    {
                      name: "Sector Wise Data",
                      path: "/admin/gala/sectorwise",
                    },
                    { name: "Students data", path: "/admin/gala/studentsdata" },
                    {
                      name: "Residential students",
                      path: "/admin/gala/residentialstudents",
                    },

                    {
                      name: "Mark attendance",
                      path: "/admin/gala/markattendance",
                    },
                  ]}
                  open={openMenu === "Students Gala"}
                  onToggle={() => toggleMenu("Students Gala")}
                  pathname={pathname}
                  expanded={true}
                />

                <NavItem
                  label="Calendar"
                  icon="📅"
                  active={pathname === "/admin/calendar"}
                  onClick={() => router.push("/admin/calendar")}
                  expanded={true}
                />

                <NavItem
                  label="Profile"
                  icon="👤"
                  active={pathname === "/admin/profile"}
                  onClick={() => router.push("/admin/profile")}
                  expanded={true}
                />
              </nav>
            </motion.aside>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-30 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Content ───────────────────────── */}
      <div className="flex-1 flex flex-col">
        <Navbar setSidebarOpen={setMobileSidebarOpen} />
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   Navbar
────────────────────────────── */
function Navbar({
  setSidebarOpen,
}: {
  setSidebarOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
}) {
  return (
    <header className="flex justify-between items-center px-5 py-4 border-b sticky top-0 z-20 shadow-sm bg-white border-gray-200">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen((p) => !p)}
          className="p-2 border rounded-md md:hidden hover:bg-gray-100 transition"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-xl md:text-2xl font-semibold">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 rounded-md text-sm border bg-white border-gray-200 text-gray-700 placeholder-gray-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
            A
          </div>
          <span className="hidden sm:block text-sm font-medium">Admin</span>
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────
   NavItem
────────────────────────────── */
function NavItem({
  label,
  icon,
  active,
  onClick,
  expanded,
}: {
  label: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
  expanded?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      title={!expanded ? label : ""}
      className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm transition ${
        active ? "bg-indigo-600 text-white" : "hover:bg-indigo-50 text-gray-700"
      }`}
    >
      <span>{icon}</span>
      {expanded && <span>{label}</span>}
    </div>
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
  pathname,
  expanded,
}: {
  label: string;
  icon: string;
  items: { name: string; path: string }[];
  open: boolean;
  onToggle: () => void;
  pathname: string;
  expanded: boolean;
}) {
  const router = useRouter();

  return (
    <div>
      <button
        onClick={onToggle}
        title={!expanded ? label : ""}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition ${
          open
            ? "bg-indigo-100 text-indigo-700"
            : "hover:bg-indigo-50 text-gray-700"
        }`}
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          {expanded && <span>{label}</span>}
        </div>

        {expanded && (
          <motion.div
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        )}
      </button>

      {/* Dropdown Items */}
      <AnimatePresence>
        {open && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="ml-6 mt-1 space-y-1"
          >
            {items.map((item) => (
              <div
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`py-1.5 px-2 rounded-md cursor-pointer text-sm transition ${
                  pathname === item.path
                    ? "font-semibold bg-indigo-50 text-indigo-600"
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
