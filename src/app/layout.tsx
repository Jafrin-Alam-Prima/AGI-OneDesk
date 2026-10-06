import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "AGI OneDesk",
  description: "Anwar Group of Industries — HRMS, ESS & Performance Platform",
  icons: { icon: "/anwars-logo.webp", shortcut: "/anwars-logo.webp", apple: "/anwars-logo.webp" },
};

export const viewport: Viewport = {
  themeColor: "#DE3332",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
