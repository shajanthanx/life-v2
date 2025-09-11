import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Manager - Personal Dashboard",
  description: "A comprehensive personal life management dashboard for productivity, health, finance, and lifestyle tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans antialiased"
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
