import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pepe Lui",
  description: "Pepe Lui · Menú online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
