"use client";

import { useState } from "react";
import DivisionDelegatesTable from "./DIvisionDeligates";
import StudentsDetails from "./StudentsDetails";

export default function DivisionTabs({ divisionName }: { divisionName: string }) {
  const [active, setActive] = useState<"divdelegates" | "sectordelegates">("divdelegates");

  const tabs = [
    { id: "divdelegates", label: "Division Delegates" },
    { id: "sectordelegates", label: "Sector Delegates" },
  ] as const;

  return (
    <div className="relative z-20 pointer-events-auto">
      {/* Tab Switcher */}
      <div className="flex max-w-md mx-auto mb-8 bg-slate-800/80 p-1.5 rounded-2xl border border-purple-500/20 backdrop-blur-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              active === tab.id
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {active === "divdelegates" && (
          <DivisionDelegatesTable key={`unit-${divisionName}`} divisionName={divisionName} />
        )}
        {active === "sectordelegates" && (
          <StudentsDetails divisionName={divisionName} />
        )}
      </div>
    </div>
  );
}
