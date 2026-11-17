"use client";

import { Suspense } from "react";
import { Loading, PageShell } from "@/app/adminlogin/mutaallim/shared";
import CampusesView from "@/app/adminlogin/mutaallim/views/CampusesView";

export default function MutaallimReportCampusesPage() {
  return (
    <PageShell title="Campus-wise registrations">
      <Suspense fallback={<Loading />}>
        <CampusesView />
      </Suspense>
    </PageShell>
  );
}
