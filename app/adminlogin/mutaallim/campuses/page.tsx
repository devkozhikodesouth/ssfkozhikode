"use client";

import { Suspense } from "react";
import { Loading, PageShell } from "../shared";
import CampusesView from "../views/CampusesView";

export default function MutaallimCampusesPage() {
  return (
    <PageShell title="Campus-wise registrations">
      <Suspense fallback={<Loading />}>
        <CampusesView />
      </Suspense>
    </PageShell>
  );
}
