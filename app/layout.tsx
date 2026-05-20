import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudentEssentials — Pack Smart. Land Ready.",
  description: "Essential services for international students heading to the UK. Bedding packs, SIM cards, airport transfers, insurance and more — one cart, one checkout.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "StudentEssentials — Pack Smart. Land Ready.",
    description: "Everything you need before your UK journey begins.",
    url: "https://student-essentials.com",
    siteName: "StudentEssentials",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}