"use client";

import { PageShell } from "../shared";
import AttendanceView from "../views/AttendanceView";

export default function MutaallimAttendancePage() {
  return (
    <PageShell title="Mark attendance">
      <AttendanceView />
    </PageShell>
  );
}
