"use client";

import { useState } from "react";
import DivisionTable from "./DivisionTable";
import UnitTable from "./UnitTable";

export default function DivisionTabs({ divisionName }: { divisionName: string }) {
  const [active, setActive] = useState<"sector" | "unit">("sector");

  const tabs = [
    { id: "sector", label: "Sector Wise" },
    { id: "unit", label: "Unit Wise" },
  ] as const;

  return (
    <div className="relative z-20 pointer-events-auto">
      {/* Tab Buttons */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-200 rounded-xl p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none
                ${active === tab.id
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-600 hover:text-gray-800"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Rendering */}
      <div className="pointer-events-auto ">
        {active === "sector" ? (
          <DivisionTable divisionName={divisionName} />
        ) : (
          <UnitTable key={`unit-${divisionName}`} divisionName={divisionName} />
        )}
      </div>
    </div>
  );
}
