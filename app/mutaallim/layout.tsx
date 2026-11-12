import type { Metadata } from "next";
import { Anek_Malayalam, Noto_Sans_Malayalam } from "next/font/google";

// Display + ticket face: bold, geometric, full Latin + Malayalam coverage
const display = Anek_Malayalam({
  subsets: ["malayalam", "latin"],
  variable: "--nf-mut-display",
  display: "swap",
});
// Malayalam fallback for body copy (Latin comes from the site's Plus Jakarta Sans)
const body = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  variable: "--nf-mut-ml",
  display: "swap",
});

const title = "Muta'allim Sammelanam, Mukkam | SSF Kozhikode South";
const description = "Muta'allim Sammelanam, Mukkam — 25 Nov 2026. Register with your mobile number and get your QR pass.";
const image = { url: "/mutaallim-og.jpg", width: 1200, height: 630, alt: "മുതഅല്ലിം സമ്മേളനം — മുക്കം · SSF Kozhikode South" };

export const metadata: Metadata = {
  title,
  description,
  openGraph: { type: "website", url: "/mutaallim", title, description, images: [image], siteName: "SSF Kozhikode South" },
  twitter: { card: "summary_large_image", title, description, images: [image.url] },
};

export default function MutaallimLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${body.variable}`}>{children}</div>;
}
