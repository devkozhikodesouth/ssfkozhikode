import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import LayoutClient from "./components/LayoutClient";

const googleSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-google-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ssfkozhikodesouth.com"),
  title: "Grand Conclave 26 | SSF Kozhikode South",
  description: "Official portal of Grand Conclave 26 — SSF Kozhikode South",
  icons: { icon: "/logo.png" },
  openGraph: {
    title: "Grand Conclave 26 | SSF Kozhikode South",
    description: "Official portal of Grand Conclave 26 — SSF Kozhikode South",
    images: [
      {
        url: "/thumb.webp",
        width: 1200,
        height: 630,
        alt: "Grand Conclave 26",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grand Conclave 26 | SSF Kozhikode South",
    description: "Official portal of Grand Conclave 26 — SSF Kozhikode South",
    images: ["/thumb.webp"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={googleSans.variable}>
      <body className={`${googleSans.className} min-h-screen bg-[#FCFCFC] [background:radial-gradient(ellipse_55%_45%_at_50%_55%,#B4D2EB_0%,#EAF4FF_35%,#F7FBFF_60%,#FCFCFC_100%)] bg-fixed bg-no-repeat bg-cover antialiased`}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
