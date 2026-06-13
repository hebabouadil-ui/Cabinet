import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, Euro } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/site/motion";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const services = await prisma.service
    .findMany({ where: { active: true }, select: { slug: true } })
    .catch(() => []);
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service) return {};
  return { title: service.name, description: service.excerpt };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service || !service.active) notFound();

  const others = await prisma.service.findMany({
    where: { active: true, NOT: { id: service.id } },
    orderBy: { order: "asc" },
    take: 3,
  });

  return (
    <>
      <section className="bg-primary-50 py-16">
        <div className="container grid items-center gap-10 md:grid-cols-2">
          <FadeIn>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-600">
              Nos soins
            </p>
            <h1 className="heading-display">{service.name}</h1>
            <p className="mt-4 text-lg text-gray-600">{service.excerpt}</p>
            <div className="mt-6 flex flex-wrap gap-6 text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <Clock className="h-5 w-5 text-primary-600" aria-hidden />
                {service.duration} minutes
              </span>
              <span className="flex items-center gap-2 text-gray-700">
                <Euro className="h-5 w-5 text-primary-600" aria-hidden />
                {service.price > 0 ? formatPrice(service.price) : "Sur devis"}
              </span>
            </div>
            <div className="mt-8">
              <Link href={`/book?service=${service.id}`}>
                <Button size="lg">
                  Réserver ce soin <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-[2rem] shadow-xl">
              <Image
                src={
                  service.image ??
                  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80"
                }
                alt={service.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding">
        <div className="container grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FadeIn>
              <h2 className="mb-6 font-display text-2xl font-semibold text-primary-900">
                En quoi consiste ce soin ?
              </h2>
              <div className="space-y-4 leading-relaxed text-gray-600">
                {service.description.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <h3 className="mb-4 mt-10 font-display text-xl font-semibold text-primary-900">
                Déroulement d&apos;une séance
              </h3>
              <ul className="space-y-3">
                {[
                  "Échange et évaluation de votre état du jour",
                  "Traitement adapté : techniques manuelles et/ou instrumentales",
                  "Exercices thérapeutiques guidés",
                  "Conseils et programme à poursuivre chez vous",
                ].map((step) => (
                  <li key={step} className="flex items-start gap-3 text-gray-700">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary-600"
                      aria-hidden
                    />
                    {step}
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>

          <aside>
            <FadeIn delay={0.1}>
              <div className="rounded-2xl border border-primary-100 bg-sand-50 p-6">
                <h3 className="mb-4 font-semibold text-primary-900">Autres soins</h3>
                <ul className="space-y-3">
                  {others.map((other) => (
                    <li key={other.id}>
                      <Link
                        href={`/services/${other.slug}`}
                        className="flex items-center justify-between rounded-xl bg-white p-3 text-sm font-medium text-primary-800 shadow-sm transition-colors hover:bg-primary-50"
                      >
                        {other.name}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/book" className="mt-6 block">
                  <Button className="w-full">Prendre rendez-vous</Button>
                </Link>
              </div>
            </FadeIn>
          </aside>
        </div>
      </section>
    </>
  );
}
