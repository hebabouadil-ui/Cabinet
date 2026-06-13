import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FadeIn } from "@/components/site/motion";
import { BookingForm } from "@/components/booking/booking-form";

export const metadata: Metadata = { title: "Prendre rendez-vous" };

export default async function BookPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/book");
  }

  const [services, settings] = await Promise.all([
    prisma.service.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true, duration: true, price: true, excerpt: true },
    }),
    prisma.clinicSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  return (
    <section className="section-padding bg-primary-50/50">
      <div className="container max-w-3xl">
        <FadeIn className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-600">
            Réservation
          </p>
          <h1 className="heading-display">Prendre rendez-vous</h1>
          <p className="mt-3 text-gray-600">
            Choisissez votre soin, une date et un horaire. Vous recevrez une
            confirmation par email{settings?.whatsapp ? " et WhatsApp" : ""}.
          </p>
        </FadeIn>
        <Suspense>
          <BookingForm services={services} maxAdvanceDays={settings?.maxAdvanceDays ?? 60} />
        </Suspense>
      </div>
    </section>
  );
}
