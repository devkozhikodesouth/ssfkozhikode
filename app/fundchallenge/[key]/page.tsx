import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FundChallenge from "../FundChallenge";
import { resolveFundKey } from "@/app/lib/fundLinks";

export const dynamic = "force-dynamic";

// Private link: keep it out of search engines
export const metadata: Metadata = {
  title: "Fund Challenge | SSF Kozhikode South",
  description: "Fund Challenge — SSF Kozhikode South District Committee.",
  robots: { index: false, follow: false },
};

export default async function FundChallengeKeyPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const group = await resolveFundKey(key);
  if (!group) notFound();

  return <FundChallenge group={group} fundKey={key} />;
}
