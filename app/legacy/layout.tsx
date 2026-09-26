import type { Metadata } from "next";
import { Orbitron, Silkscreen, Montserrat } from "next/font/google";

const legacyDisplay = Orbitron({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-legacy-display",
  display: "swap",
});

const legacyPixel = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-legacy-pixel",
  display: "swap",
});

const legacyBody = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-legacy-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "It’s our Legacy | SSF Kozhikode South",
  description:
    "It’s our Legacy — Izza code Gather. 2026 Sep 27, Sunday 12:00 PM at Cheenadath, Puthiyangadi. SSF Kozhikode South",
  openGraph: {
    title: "It’s our Legacy | SSF Kozhikode South",
    description:
      "Izza code Gather — 2026 Sep 27, Sunday 12:00 PM at Cheenadath, Puthiyangadi",
  },
  twitter: {
    card: "summary_large_image",
    title: "It’s our Legacy | SSF Kozhikode South",
  },
};

export default function LegacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${legacyDisplay.variable} ${legacyPixel.variable} ${legacyBody.variable}`}>
      {children}
    </div>
  );
}
