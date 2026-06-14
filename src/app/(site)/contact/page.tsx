import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { FadeIn } from "@/components/site/motion";
import { ContactForm } from "@/components/site/contact-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez le cabinet par téléphone, email, WhatsApp ou via notre formulaire. Adresse, plan d'accès et horaires.",
};

export default async function ContactPage() {
  const settings = await prisma.clinicSettings
    .findUnique({ where: { id: "singleton" } })
    .catch(() => null);

  const whatsappNumber = settings?.whatsapp?.replace(/[^+\d]/g, "");

  return (
    <>
      <section className="bg-primary-50 py-16">
        <div className="container max-w-3xl text-center">
          <FadeIn>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-600">
              Contact
            </p>
            <h1 className="heading-display">Parlons de votre santé</h1>
            <p className="mt-4 text-lg text-gray-600">
              Une question, un doute sur la prise en charge ? Nous vous répondons
              rapidement par le canal de votre choix.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding">
        <div className="container grid gap-12 lg:grid-cols-2">
          <FadeIn className="space-y-6">
            <h2 className="font-display text-2xl font-semibold text-primary-900">
              Coordonnées
            </h2>
            <ul className="space-y-4">
              {settings?.address && (
                <li className="flex items-start gap-4 rounded-2xl border border-primary-100 bg-white p-5">
                  <MapPin className="h-6 w-6 shrink-0 text-primary-700" aria-hidden />
                  <div>
                    <p className="font-medium text-primary-900">Adresse</p>
                    <p className="text-sm text-gray-600">{settings.address}</p>
                  </div>
                </li>
              )}
              {settings?.phone && (
                <li className="flex items-start gap-4 rounded-2xl border border-primary-100 bg-white p-5">
                  <Phone className="h-6 w-6 shrink-0 text-primary-700" aria-hidden />
                  <div>
                    <p className="font-medium text-primary-900">Téléphone</p>
                    <a
                      href={`tel:${settings.phone.replace(/\s/g, "")}`}
                      className="text-sm text-primary-700 hover:underline"
                    >
                      {settings.phone}
                    </a>
                  </div>
                </li>
              )}
              {settings?.email && (
                <li className="flex items-start gap-4 rounded-2xl border border-primary-100 bg-white p-5">
                  <Mail className="h-6 w-6 shrink-0 text-primary-700" aria-hidden />
                  <div>
                    <p className="font-medium text-primary-900">Email</p>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-sm text-primary-700 hover:underline"
                    >
                      {settings.email}
                    </a>
                  </div>
                </li>
              )}
              {whatsappNumber && (
                <li className="flex items-start gap-4 rounded-2xl border border-primary-100 bg-white p-5">
                  <MessageCircle className="h-6 w-6 shrink-0 text-[#25D366]" aria-hidden />
                  <div>
                    <p className="font-medium text-primary-900">WhatsApp</p>
                    <a
                      href={`https://wa.me/${whatsappNumber.replace("+", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-700 hover:underline"
                    >
                      Écrivez-nous directement
                    </a>
                  </div>
                </li>
              )}
            </ul>

            <div className="overflow-hidden rounded-2xl border border-primary-100 shadow-sm">
              <iframe
                title="Plan d'accès au cabinet"
                src={
                  settings?.mapEmbedUrl ??
                  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3325.0!2d-7.6187!3d33.5731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDM0JzIzLjIiTiA3wrAzNycwNy4zIlc!5e0!3m2!1sfr!2s!4v1"
                }
                width="100%"
                height="280"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-2xl border border-primary-100 bg-white p-8 shadow-sm">
              <h2 className="mb-6 font-display text-2xl font-semibold text-primary-900">
                Envoyez-nous un message
              </h2>
              <ContactForm />
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
