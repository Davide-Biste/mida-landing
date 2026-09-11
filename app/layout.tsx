import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { dictionaries, defaultLocale } from "./i18n/dictionaries";

// Body + display type use the platform system stack (SF Pro on Apple devices —
// the same face the Mida app itself uses). Only numeric / mono touches use a
// downloaded face.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Static export can't read the request, so metadata + <html lang> use the
// default locale at build time; the page swaps language on the client.
export const metadata: Metadata = {
  title: dictionaries[defaultLocale].metadata.title,
  description: dictionaries[defaultLocale].metadata.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={defaultLocale} className={geistMono.variable}>
      <body>{children}</body>
    </html>
  );
}
