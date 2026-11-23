"use client";

import { useEffect, useState } from "react";

/* Whether new registrations are open. One request per page load, shared by
 * every caller. null while loading (treat as open: the API enforces the truth). */
let pending: Promise<boolean> | null = null;

export function useRegistrationOpen(): boolean | null {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    pending ??= fetch("/api/mutaallim/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d?.registrationOpen !== false)
      .catch(() => true);
    let live = true;
    pending.then((v) => live && setOpen(v));
    return () => {
      live = false;
    };
  }, []);
  return open;
}
