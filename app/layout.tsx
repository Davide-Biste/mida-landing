import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { dictionaries } from "./i18n/dictionaries";
import { getLocale } from "./i18n/getLocale";

// Body + display type use the platform system stack (SF Pro on Apple devices —
// the same face the Mida app itself uses), so the site reads as a natural
// extension of the product for its iPhone audience. Only the numeric / mono
// touches use a downloaded face.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = dictionaries[await getLocale()];
  return { title: metadata.title, description: metadata.description };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={geistMono.variable}>
      <body>{children}</body>
    </html>
  );
}
