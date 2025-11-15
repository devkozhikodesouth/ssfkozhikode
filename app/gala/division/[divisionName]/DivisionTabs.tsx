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
    { id: "students", label: "Students Data" },
  ] as const;

  return (
    <div className="relative z-20 pointer-events-auto">
      {/* Tile Style Tabs */}
<div className="flex max-w-md mx-auto mb-6 bg-gray-100 rounded-2xl p-1">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      type="button"
      onClick={() => setActive(tab.id)}
      className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all
        ${active === tab.id
          ? "bg-white shadow text-blue-600"
          : "text-gray-600"
        }`}
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
