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
      <div className="flex max-w-md mx-auto mb-8 bg-gray-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer ${
              active === tab.id
                ? "bg-white shadow text-purple-700 font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {active === "divdelegates" && (
          <DivisionDelegatesTable key={`unit-${divisionName}`} divisionName={divisionName} lightMode={true} />
        )}
        {active === "sectordelegates" && (
          <StudentsDetails divisionName={divisionName} lightMode={true} />
        )}
      </div>
    </div>
  );
}
