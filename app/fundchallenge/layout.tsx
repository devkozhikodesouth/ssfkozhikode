import { Lexend } from "next/font/google";

// Receipt typeface (geometric sans matching the e-receipt design)
const receiptFont = Lexend({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-fc-receipt",
  display: "swap",
});

export default function FundChallengeLayout({ children }: { children: React.ReactNode }) {
  return <div className={receiptFont.variable}>{children}</div>;
}
