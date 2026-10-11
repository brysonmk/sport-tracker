import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Absolute base for share links and images (og:image) in metadata.
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Sports Tracker",
    template: "%s · Sports Tracker",
  },
  description: "Standings, player stats and live scores for your rec or pickup soccer league. No signup.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1211" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-dvh flex-col font-sans antialiased`}>
        <Header />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-12 pt-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
