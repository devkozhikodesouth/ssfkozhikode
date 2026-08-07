"use client";

import { useEffect, useState } from "react";

export function useAttendanceMode() {
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("enable_attendance_mode") === "true";
      setEnabled(stored);
    }

    const handleModeChange = () => {
      if (typeof window !== "undefined") {
        setEnabled(localStorage.getItem("enable_attendance_mode") === "true");
      }
    };

    window.addEventListener("attendance_mode_changed", handleModeChange);
    window.addEventListener("storage", handleModeChange);

    return () => {
      window.removeEventListener("attendance_mode_changed", handleModeChange);
      window.removeEventListener("storage", handleModeChange);
    };
  }, []);

  const toggleAttendanceMode = () => {
    const nextState = !enabled;
    setEnabled(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("enable_attendance_mode", String(nextState));
      window.dispatchEvent(new Event("attendance_mode_changed"));
    }
  };

  return { attendanceMode: enabled, toggleAttendanceMode };
}
