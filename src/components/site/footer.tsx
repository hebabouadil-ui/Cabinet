import Link from "next/link";
import { CalendarCheck, Facebook, Instagram, Linkedin, MapPin, Phone, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CLINIC_NAME } from "@/lib/constants";

export async function Footer() {
  const settings = await prisma.clinicSettings
    .findUnique({ where: { id: "singleton" } })
    .catch(() => null);

  return (
    <footer className="bg-primary-900 text-primary-50">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-4 md:col-span-2 md:pr-12">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
              <CalendarCheck className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-display text-lg font-semibold">
              {settings?.clinicName ?? CLINIC_NAME}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-primary-100/80">
            {settings?.tagline ??
              "Cabinet de kinésithérapie dédié au soulagement de la douleur, à la rééducation et au retour au mouvement. Prise de rendez-vous en ligne 24h/24."}
          </p>
          {(settings?.facebookUrl || settings?.instagramUrl || settings?.linkedinUrl) && (
            <div className="flex gap-3 pt-1">
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                >
                  <Facebook className="h-4 w-4" aria-hidden />
                </a>
              )}
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                >
                  <Instagram className="h-4 w-4" aria-hidden />
                </a>
              )}
              {settings?.linkedinUrl && (
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                >
                  <Linkedin className="h-4 w-4" aria-hidden />
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-100">
            Navigation
          </h3>
          <ul className="space-y-2 text-sm text-primary-100/80">
            <li><Link href="/services" className="hover:text-white">Nos soins</Link></li>
            <li><Link href="/about" className="hover:text-white">À propos</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/book" className="hover:text-white">Prendre rendez-vous</Link></li>
            <li><Link href="/login" className="hover:text-white">Espace patient</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-100">
            Contact
          </h3>
          <ul className="space-y-3 text-sm text-primary-100/80">
            {settings?.address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {settings.address}
              </li>
            )}
            {settings?.phone && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-white">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings?.email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-primary-100/60 md:flex-row">
          <p>
            © {new Date().getFullYear()} {settings?.clinicName ?? CLINIC_NAME}. Tous
            droits réservés.
          </p>
          <p>Kinésithérapie — Rééducation — Bien-être</p>
        </div>
      </div>
    </footer>
  );
}
