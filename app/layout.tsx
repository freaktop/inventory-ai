import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
export const metadata: Metadata = { title: "Inventory AI", description: "Track stock and receive low-stock alerts." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><SessionProvider>{children}</SessionProvider></body></html>;
}