import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ParticlesBackground from "@/components/ui/ParticlesBackground";

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
        {children}
      </body>
    </html>
  );
}
