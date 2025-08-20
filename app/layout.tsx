import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ClientProviders } from "./helpers/ClientProviders";
import localFont from "next/font/local";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "mallow.dev",
  description: "mallow",
};

const insSerif = localFont({
  src: "./fonts/InstrumentSerif-Regular.ttf",
  weight: "500",
  style: "normal",
  variable: "--font-my",
  display: "swap",
});
const insSerifIt = localFont({
  src: "./fonts/InstrumentSerif-Italic.ttf",
  weight: "500",
  style: "Italic",
  variable: "--font-my",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics Scripts */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-244XGR0JJ9"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-244XGR0JJ9');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${insSerifIt.variable} ${insSerif.variable} antialiased`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
