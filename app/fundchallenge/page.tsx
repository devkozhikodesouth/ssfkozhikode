import type { Metadata } from "next";
import FundChallenge from "./FundChallenge";

export const metadata: Metadata = {
  title: "Fund Challenge | SSF Kozhikode South",
  description:
    "Fund Challenge — live collection progress of the SSF Kozhikode South District Committee executive members.",
  openGraph: {
    title: "Fund Challenge | SSF Kozhikode South",
    description: "Live collection progress of the District Committee executive members.",
  },
};

export default function FundChallengePage() {
  return <FundChallenge />;
}
