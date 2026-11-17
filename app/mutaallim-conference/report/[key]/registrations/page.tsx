"use client";

import { Suspense } from "react";
import { Loading, PageShell } from "@/app/adminlogin/mutaallim/shared";
import RegistrationsView from "@/app/adminlogin/mutaallim/views/RegistrationsView";

export default function MutaallimReportRegistrationsPage() {
  return (
    <PageShell title="All registrations">
      <Suspense fallback={<Loading />}>
        <RegistrationsView />
      </Suspense>
    </PageShell>
  );
}
