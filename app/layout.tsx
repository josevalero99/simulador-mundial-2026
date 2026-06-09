import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ParticlesBackground from "@/components/ui/ParticlesBackground";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Simulador Mundial 2026",
  description:
    "Simula la Copa Mundial 2026: grupos, calendario, cruces y criterios de desempate de la FIFA en tiempo real.",
  appleWebApp: {
    capable: true,
    title: "Mundial 2026",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen text-[#f5f5f5]`}
      >
        <ParticlesBackground />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
