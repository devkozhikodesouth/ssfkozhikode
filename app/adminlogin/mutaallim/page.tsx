"use client";

import { PageShell } from "./shared";
import DivisionsView from "./views/DivisionsView";

export default function MutaallimDivisionsPage() {
  return (
    <PageShell title="Division-wise registrations">
      <DivisionsView />
    </PageShell>
  );
}
