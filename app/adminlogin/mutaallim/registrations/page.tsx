"use client";

import { Suspense } from "react";
import { Loading, PageShell } from "../shared";
import RegistrationsView from "../views/RegistrationsView";

export default function MutaallimRegistrationsPage() {
  return (
    <PageShell title="All registrations">
      <Suspense fallback={<Loading />}>
        <RegistrationsView />
      </Suspense>
    </PageShell>
  );
}
