import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "../providers/QueryProvider";
import { LanguageProvider } from "../context/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inventory Management",
  description: "Smart Inventory System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq">
      <body className={`${inter.className} h-screen overflow-hidden bg-white`}>
        <LanguageProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}