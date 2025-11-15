"use client";

import { useState } from "react";
import DivisionTable from "./DivisionTable";
import UnitTable from "./UnitTable";
import StudentsDetails from "./StudentsDetails";

export default function DivisionTabs({ divisionName }: { divisionName: string }) {
  const [active, setActive] = useState<"sector" | "unit" | "students">("sector");

  const tabs = [
    { id: "sector", label: "Sector Wise" },
    { id: "unit", label: "Unit Wise" },
    { id: "students", label: "Studenets Data" },
  ] as const;

  return (
    <div className="relative z-20 pointer-events-auto">
      {/* Tile Style Tabs */}
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`py-3 rounded-xl font-semibold border transition duration-200
              ${active === tab.id
                ? "bg-blue-600 text-white shadow-md border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {active === "sector" && <DivisionTable divisionName={divisionName} />}
        {active === "unit" && <UnitTable key={`unit-${divisionName}`} divisionName={divisionName} />}
        {active === "students" && (<StudentsDetails divisionName={divisionName} />)}
      </div>
    </div>
  );
}
