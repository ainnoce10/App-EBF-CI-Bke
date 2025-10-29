import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "EBF Bouaké - Électricité, Bâtiment, Froid",
  description: "EBF Bouaké - Votre partenaire de confiance pour tous vos projets d'électricité, de bâtiment et de froid à Bouaké. Service 24/7, diagnostic gratuit.",
  keywords: ["EBF Bouaké", "électricien", "Bouaké", "électricité", "bâtiment", "froid", "Côte d'Ivoire"],
  authors: [{ name: "EBF Bouaké" }],
  openGraph: {
    title: "EBF Bouaké - Électricité, Bâtiment, Froid",
    description: "Votre partenaire de confiance pour tous vos projets d'électricité, de bâtiment et de froid à Bouaké. Service 24/7, diagnostic gratuit.",
    url: "https://ebfbouake.com",
    siteName: "EBF Bouaké",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EBF Bouaké - Électricité, Bâtiment, Froid",
    description: "Votre partenaire de confiance pour tous vos projets d'électricité, de bâtiment et de froid à Bouaké. Service 24/7, diagnostic gratuit.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}