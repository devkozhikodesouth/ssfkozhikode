"use client";

import { PageShell } from "@/app/adminlogin/mutaallim/shared";
import AttendanceView from "@/app/adminlogin/mutaallim/views/AttendanceView";

export default function MutaallimReportAttendancePage() {
  return (
    <PageShell title="Mark attendance">
      <AttendanceView />
    </PageShell>
  );
}
