import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ocusense AI - Dashboard",
  description: "Portal rekam medis dan pemantauan deteksi katarak IoT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* Injeksi skrip Phosphor Icons tanpa npm install */}
        <script src="https://unpkg.com/@phosphor-icons/web" defer></script>
      </head>
      <body className="flex h-screen overflow-hidden text-slate-800 bg-slate-50">
        {children}
      </body>
    </html>
  );
}