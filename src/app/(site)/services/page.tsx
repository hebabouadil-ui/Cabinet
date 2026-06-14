import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/site/motion";
import { CtaSection } from "@/components/site/home-sections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nos soins",
  description:
    "Kinésithérapie, rééducation sportive, traitement du dos, thérapie manuelle, dry needling, soins à domicile : découvrez tous nos soins.",
};

export default async function ServicesPage() {
  const services = await prisma.service
    .findMany({ where: { active: true }, orderBy: { order: "asc" } })
    .catch(() => []);

  return (
    <>
      <section className="bg-primary-50 py-16">
        <div className="container max-w-3xl text-center">
          <FadeIn>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-600">
              Nos soins
            </p>
            <h1 className="heading-display">
              Des soins spécialisés pour chaque besoin
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Du traitement de la douleur aiguë à la préparation sportive, chaque
              prise en charge commence par un bilan complet et un plan personnalisé.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding">
        <div className="container grid gap-8 md:grid-cols-2">
          {services.map((service, i) => (
            <FadeIn key={service.id} delay={(i % 2) * 0.1}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-primary-100/60 bg-white shadow-sm transition-shadow hover:shadow-lg">
                <div className="relative h-52 w-full overflow-hidden bg-primary-100">
                  <Image
                    src={
                      service.image ??
                      `https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=75`
                    }
                    alt={service.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-display text-xl font-semibold text-primary-900">
                      {service.name}
                    </h2>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" aria-hidden /> {service.duration} min
                    </span>
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-gray-600">
                    {service.excerpt}
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="font-semibold text-primary-800">
                      {service.price > 0 ? formatPrice(service.price) : "Sur devis"}
                    </p>
                    <Link href={`/services/${service.slug}`}>
                      <Button variant="outline" size="sm">
                        Détails <ArrowRight className="h-4 w-4" aria-hidden />
                      </Button>
                    </Link>
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      <CtaSection />
    </>
  );
}
