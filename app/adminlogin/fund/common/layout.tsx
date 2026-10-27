import { Lexend } from "next/font/google";

// Same receipt typeface as the public Fund Challenge pages
const receiptFont = Lexend({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-fc-receipt",
  display: "swap",
});

export default function CommonCollectionLayout({ children }: { children: React.ReactNode }) {
  return <div className={receiptFont.variable}>{children}</div>;
}
