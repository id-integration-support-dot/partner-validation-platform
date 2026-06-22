import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Partner Integration Platform",
  description: "Partner Test Submission & Assessment Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
