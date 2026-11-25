import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SupportDesk – Issue Management System",
  description: "Modern, simple ticketing and customer support workspace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0e17] text-[#f3f4f6] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
