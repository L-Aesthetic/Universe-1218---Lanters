import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sector 2814 // Oan Central Archive",
  description:
    "An unofficial Green Lantern fan experience set inside the Oan Central Archive.",
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
      <body>{children}</body>
    </html>
  );
}
