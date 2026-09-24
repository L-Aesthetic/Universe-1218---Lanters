import type { Metadata, Viewport } from "next";
import { Barlow, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Universe-1218 // Sector 2814 Archive",
  description:
    "An unofficial, non-commercial Green Lantern fan experience set in the Universe-1218 continuity.",
};

export const viewport: Viewport = {
  themeColor: "#030705",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${barlow.variable} ${plexMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
