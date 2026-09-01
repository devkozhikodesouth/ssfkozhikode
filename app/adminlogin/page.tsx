"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminHome() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/adminlogin/gc26/totaldelegates");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-gray-500 font-semibold animate-pulse">
        Loading Grand Conclave 26 Dashboard...
      </p>
    </div>
  );
}
