import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Cabinet Kiné Santé — Kinésithérapie & Rééducation",
    template: "%s | Cabinet Kiné Santé",
  },
  description:
    "Cabinet de kinésithérapie moderne : traitement du dos, rééducation sportive et post-opératoire, thérapie manuelle, dry needling. Prise de rendez-vous en ligne.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Cabinet Kiné Santé",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
