"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, Search, ChevronDown, Menu, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DivisionStudentTable from "@/app/components/DivisionStudentTable";

export default function DashboardLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState("Tables");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verify authentication via API call
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/login/admin", { method: "GET" });
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          router.push("/admin/login");
        }
      } catch (error) {
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const toggleMenu = (label: string) => {
    setOpenMenu(openMenu === label ? "" : label);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/admin/login");
    }
  };

  return (
    <div className={`flex min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -260 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed md:static z-40 w-64 h-full border-r ${darkMode ? "border-gray-700 bg-gray-900" : "border-gray-100 bg-white"}`}
      >
        <div className="p-6 flex items-center justify-between text-xl font-bold border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500"></div>
            NextAdmin
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-gray-600"
          >
            ✖️
          </button>
        </div>

        <nav className="px-4 space-y-2 overflow-y-auto h-[calc(100%-80px)]">
          <div className="text-gray-500 text-xs font-semibold uppercase mt-4">Main Menu</div>
          <NavItem label="Dashboard" icon="📊" />
          <NavItem label="Calendar" icon="📅" />
          <NavItem label="Profile" icon="👤" />

          <NavGroup label="Forms" icon="📝" items={["Form Elements", "Form Layout"]} open={openMenu === "Forms"} onToggle={() => toggleMenu("Forms")} />
          <NavGroup label="Tables" icon="📋" items={["Tables"]} open={openMenu === "Tables"} onToggle={() => toggleMenu("Tables")} />
          <NavGroup label="Pages" icon="📄" items={["Login", "Register"]} open={openMenu === "Pages"} onToggle={() => toggleMenu("Pages")} />

          <div className="text-gray-500 text-xs font-semibold uppercase mt-6">Others</div>
          <NavGroup label="Charts" icon="📈" items={["Bar", "Pie", "Line"]} open={openMenu === "Charts"} onToggle={() => toggleMenu("Charts")} />
          <NavGroup label="UI Elements" icon="⚙️" items={["Buttons", "Cards"]} open={openMenu === "UI Elements"} onToggle={() => toggleMenu("UI Elements")} />
          <NavGroup label="Authentication" icon="🔐" items={["Login", "Register"]} open={openMenu === "Authentication"} onToggle={() => toggleMenu("Authentication")} />
        </nav>
      </motion.aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <main className="flex-1  transition-all">
        {/* Navbar */}
        <header
          className={`flex justify-between items-center px-6 py-4 border-b sticky top-0 z-20 ${
            darkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 border rounded-md md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-2xl font-semibold">Dashboard</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className={`pl-8  
                   pr-4 py-2 rounded-md border text-sm ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-200 text-gray-700"
                }`}
              />
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-md border">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <span className="text-sm font-medium">Admin</span>
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <DivisionStudentTable />
      </main>
    </div>
  );
}

function NavItem({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-indigo-50 cursor-pointer transition">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function NavGroup({
  label,
  icon,
  items,
  open,
  onToggle,
}: {
  label: string;
  icon: string;
  items: string[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${
          open ? "bg-indigo-100 text-indigo-600" : "hover:bg-indigo-50 cursor-pointer transition"
        }`}
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span>{label}</span>
        </div>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="ml-8 mt-1 space-y-1"
          >
            {items.map((item: string, i: number) => (
              <div key={i} className="text-sm text-indigo-500 py-1 cursor-pointer">
                {item}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
