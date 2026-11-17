"use client";

import { PageShell } from "@/app/adminlogin/mutaallim/shared";
import DivisionsView from "@/app/adminlogin/mutaallim/views/DivisionsView";

export default function MutaallimReportDivisionsPage() {
  return (
    <PageShell title="Division-wise registrations">
      <DivisionsView />
    </PageShell>
  );
}
