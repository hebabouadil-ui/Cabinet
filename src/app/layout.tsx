import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CLINIC_FULL_NAME, CLINIC_NAME } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: `${CLINIC_FULL_NAME}`,
    template: `%s | ${CLINIC_NAME}`,
  },
  description:
    "Cabinet de kinésithérapie et physiothérapie : traitement du dos, rééducation sportive et post-opératoire, thérapie manuelle, dry needling. Prise de rendez-vous en ligne.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: CLINIC_NAME,
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
