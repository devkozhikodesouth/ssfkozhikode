import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "SSF Kozhikode South",
  description: "Official website of SSF Kozhikode South",
  icons: {
    icon: "/logo.png", // or "/favicon.png" or "/favicon.svg"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
