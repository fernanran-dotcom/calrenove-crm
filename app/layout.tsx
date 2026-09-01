import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { SWRegister } from "@/components/layout/sw-register";

export const metadata: Metadata = {
  title: "Calrenove CRM",
  description: "Sistema de gestión de presupuestos de calderas",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Calrenove",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a3a5c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
        <SWRegister />
      </body>
    </html>
  );
}
