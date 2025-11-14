import type { Metadata } from "next";
import "./globals.css";
import LayoutClient from "./components/LayoutClient";

export const metadata: Metadata = {
  title: "SSF Kozhikode South",
  description: "Official website of SSF Kozhikode South",
  icons: { icon: "/Students-Gala.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
