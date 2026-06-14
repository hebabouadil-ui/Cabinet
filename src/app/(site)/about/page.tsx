import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, GraduationCap, HeartHandshake, History } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { THERAPIST_NAME, THERAPIST_TITLE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { FadeIn, Stagger, StaggerItem } from "@/components/site/motion";
import { CtaSection } from "@/components/site/home-sections";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez notre cabinet de kinésithérapie, le parcours de votre praticien, ses certifications et notre approche du soin.",
};

const certifications = [
  "Diplôme d'État de masseur-kinésithérapeute",
  "Thérapie manuelle orthopédique (OMT)",
  "Méthode McKenzie — MDT (niveaux A-D)",
  "Dry Needling certifié",
  "Kinésiotaping K-Taping Pro",
  "Rééducation vestibulaire",
];

const galleryImages = [
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=75",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=75",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=75",
  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=75",
];

export default async function AboutPage() {
  const blocks = await prisma.contentBlock
    .findMany({ where: { key: { in: ["about-intro", "therapist"] } } })
    .catch(() => []);
  const intro = blocks.find((b) => b.key === "about-intro");
  const therapist = blocks.find((b) => b.key === "therapist");

  return (
    <>
      <section className="bg-primary-50 py-16">
        <div className="container max-w-3xl text-center">
          <FadeIn>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-600">
              À propos
            </p>
            <h1 className="heading-display">
              {intro?.title ?? "Une approche humaine et fondée sur les preuves"}
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              {intro?.body ??
                "Depuis plus de 12 ans, notre cabinet accompagne les patients de tous âges dans leur rééducation."}
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding">
        <div className="container grid items-center gap-12 md:grid-cols-2">
          <FadeIn>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] shadow-xl">
              <Image
                src={
                  therapist?.image ??
                  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=900&q=80"
                }
                alt="Portrait du kinésithérapeute"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </FadeIn>
          <FadeIn delay={0.1} className="space-y-6">
            <h2 className="font-display text-3xl font-semibold text-primary-900">
              {therapist?.title ?? THERAPIST_NAME}
            </h2>
            <p className="font-medium text-primary-700">
              {therapist?.subtitle ?? THERAPIST_TITLE}
            </p>
            <p className="leading-relaxed text-gray-600">
              {therapist?.body ??
                "Spécialisé en thérapie manuelle orthopédique et rééducation du sportif."}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: History, label: "12+ ans d'expérience" },
                { icon: HeartHandshake, label: "3000+ patients suivis" },
                { icon: GraduationCap, label: "Formation continue" },
                { icon: Award, label: "Certifications reconnues" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl bg-primary-50 p-4"
                >
                  <item.icon className="h-6 w-6 shrink-0 text-primary-700" aria-hidden />
                  <p className="text-sm font-medium text-primary-900">{item.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding bg-sand-50">
        <div className="container">
          <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="heading-display">Certifications & formations</h2>
          </FadeIn>
          <Stagger className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
            {certifications.map((cert) => (
              <StaggerItem key={cert}>
                <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
                  <Award className="h-5 w-5 shrink-0 text-primary-600" aria-hidden />
                  <p className="text-sm font-medium text-gray-700">{cert}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="heading-display">Le cabinet en images</h2>
            <p className="mt-3 text-gray-600">
              Un espace moderne, lumineux et entièrement équipé pour votre rééducation.
            </p>
          </FadeIn>
          <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {galleryImages.map((src, i) => (
              <StaggerItem key={src}>
                <div className="relative aspect-square overflow-hidden rounded-2xl shadow-sm">
                  <Image
                    src={src}
                    alt={`Photo du cabinet ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <FadeIn className="mt-12 text-center">
            <Link href="/book">
              <Button size="lg">Prendre rendez-vous</Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
