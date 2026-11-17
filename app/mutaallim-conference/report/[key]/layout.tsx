import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isMutaallimReportKey } from "@/app/lib/mutaallimLink";
import { ReportSourceProvider } from "@/app/adminlogin/mutaallim/shared";

export const dynamic = "force-dynamic";

// Private report (contains phone numbers): keep it out of search engines
export const metadata: Metadata = {
  title: "Muta'allim Sammelanam — Report | SSF Kozhikode South",
  robots: { index: false, follow: false },
};

export default async function MutaallimReportLayout({
  params,
  children,
}: {
  params: Promise<{ key: string }>;
  children: React.ReactNode;
}) {
  const { key } = await params;
  if (!isMutaallimReportKey(key)) notFound();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-gradient-to-r from-purple-800 to-fuchsia-700 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
            <img src="/icon.png" alt="SSF" width={30} height={30} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold">Muta&apos;allim Sammelanam — Report</p>
            <p className="truncate text-xs text-white/80">SSF Kozhikode South</p>
          </div>
        </div>
      </header>
      <ReportSourceProvider reportKey={key}>{children}</ReportSourceProvider>
    </div>
  );
}
