import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  AlignCenter,
  ArrowRight,
  Award,
  Bone,
  Brain,
  CalendarCheck,
  Clock,
  Dumbbell,
  Hand,
  HeartPulse,
  Home,
  PersonStanding,
  Quote,
  ShieldCheck,
  Star,
  Stethoscope,
  Syringe,
  Users,
  Waves,
  Wind,
} from "lucide-react";
import type { ContentBlock, Faq, Service, Testimonial } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FadeIn, Stagger, StaggerItem } from "@/components/site/motion";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { THERAPIST_NAME, THERAPIST_TITLE } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Activity,
  AlignCenter,
  Bone,
  Brain,
  Dumbbell,
  Hand,
  HeartPulse,
  Home,
  PersonStanding,
  Stethoscope,
  Syringe,
  Waves,
  Wind,
};

export function Hero({ block }: { block: ContentBlock | null }) {
  const title = block?.title ?? "Retrouvez le mouvement,\nretrouvez votre vie";
  const [line1, line2] = title.split("\n");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white">
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-primary-100/60 blur-3xl"
        aria-hidden
      />
      <div className="container grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
        <FadeIn>
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-800">
              <Stethoscope className="h-4 w-4" aria-hidden />
              Cabinet de kinésithérapie
            </span>
            <h1 className="heading-display">
              {line1}
              {line2 && (
                <>
                  <br />
                  <span className="text-primary-700">{line2}</span>
                </>
              )}
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-gray-600">
              {block?.subtitle ??
                "Cabinet de kinésithérapie moderne dédié au soulagement de la douleur, à la rééducation et à la performance. Prenez rendez-vous en ligne en moins d'une minute."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/book">
                <Button size="lg">
                  Prendre rendez-vous <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline">
                  Découvrir nos soins
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-8 pt-4">
              {[
                { value: "12+", label: "Années d'expérience" },
                { value: "3000+", label: "Patients accompagnés" },
                { value: "4,9/5", label: "Note moyenne" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl font-semibold text-primary-800">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.15} className="relative">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] shadow-2xl">
            <Image
              src={
                block?.image ??
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80"
              }
              alt="Séance de kinésithérapie au cabinet"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 left-1/2 flex w-[85%] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl bg-white p-4 shadow-xl md:left-0 md:translate-x-[-15%]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <CalendarCheck className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary-900">
                Réservation en ligne 24h/24
              </p>
              <p className="text-xs text-gray-500">
                Confirmation par email et WhatsApp
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export function ServicesSection({ services }: { services: Service[] }) {
  return (
    <section className="section-padding bg-sand-50" id="services">
      <div className="container">
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-600">
            Nos soins
          </p>
          <h2 className="heading-display">
            Des traitements adaptés à chaque patient
          </h2>
        </FadeIn>

        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = iconMap[service.icon ?? ""] ?? Activity;
            return (
              <StaggerItem key={service.id}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-primary-100/60 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-700 group-hover:text-white">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mb-2 font-semibold text-primary-900">{service.name}</h3>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">
                    {service.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-700">
                    En savoir plus <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>

        <FadeIn className="mt-10 text-center">
          <Link href="/services">
            <Button variant="outline" size="lg">
              Voir tous les soins
            </Button>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

export function TherapistSection({ block }: { block: ContentBlock | null }) {
  return (
    <section className="section-padding">
      <div className="container grid items-center gap-12 md:grid-cols-2">
        <FadeIn className="relative order-2 md:order-1">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] shadow-xl">
            <Image
              src={
                block?.image ??
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=900&q=80"
              }
              alt="Portrait du kinésithérapeute"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -right-2 top-8 hidden rounded-2xl bg-white p-4 shadow-lg lg:block">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary-700" aria-hidden />
              <p className="text-sm font-semibold text-primary-900">
                Diplômé d&apos;État
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1} className="order-1 space-y-6 md:order-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
            Votre praticien
          </p>
          <h2 className="heading-display">{block?.title ?? THERAPIST_NAME}</h2>
          <p className="font-medium text-primary-700">
            {block?.subtitle ?? THERAPIST_TITLE}
          </p>
          <p className="leading-relaxed text-gray-600">
            {block?.body ??
              "Diplômé d'État avec une spécialisation en thérapie manuelle orthopédique et en rééducation du sportif, il a accompagné plus de 3 000 patients."}
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "Thérapie manuelle certifiée",
              "Méthode McKenzie (MDT)",
              "Dry Needling",
              "Rééducation du sportif",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary-600" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/about">
            <Button variant="outline">
              En savoir plus <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

export function BenefitsSection() {
  const benefits = [
    {
      icon: CalendarCheck,
      title: "Réservation en ligne",
      text: "Choisissez votre créneau 24h/24 et recevez confirmations et rappels par email et WhatsApp.",
    },
    {
      icon: Users,
      title: "Suivi personnalisé",
      text: "Un bilan complet à la première séance et un plan de traitement réévalué à chaque étape.",
    },
    {
      icon: Clock,
      title: "Horaires étendus",
      text: "Ouvert du lundi au samedi avec des créneaux tôt le matin et en soirée pour les actifs.",
    },
    {
      icon: ShieldCheck,
      title: "Approche fondée sur les preuves",
      text: "Des techniques validées scientifiquement, mises à jour par la formation continue.",
    },
  ];

  return (
    <section className="section-padding bg-primary-900 text-white">
      <div className="container">
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-100/70">
            Pourquoi nous choisir
          </p>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Une expérience patient pensée pour vous
          </h2>
        </FadeIn>

        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <StaggerItem key={benefit.title}>
              <div className="h-full rounded-2xl bg-white/5 p-6 backdrop-blur transition-colors hover:bg-white/10">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <benefit.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mb-2 font-semibold">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-primary-100/80">{benefit.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="section-padding bg-sand-50">
      <div className="container">
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-600">
            Témoignages
          </p>
          <h2 className="heading-display">Ils nous font confiance</h2>
        </FadeIn>

        <Stagger className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.id}>
              <figure className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm">
                <Quote className="mb-4 h-8 w-8 text-primary-200" aria-hidden />
                <blockquote className="flex-1 text-sm leading-relaxed text-gray-700">
                  « {t.content} »
                </blockquote>
                <figcaption className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-primary-900">{t.name}</p>
                    {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
                  </div>
                  <div className="flex" aria-label={`Note : ${t.rating} sur 5`}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                        aria-hidden
                      />
                    ))}
                  </div>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function FaqSection({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container max-w-3xl">
        <FadeIn className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-600">
            FAQ
          </p>
          <h2 className="heading-display">Questions fréquentes</h2>
        </FadeIn>
        <FadeIn>
          <FaqAccordion faqs={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
        </FadeIn>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="section-padding bg-gradient-to-r from-primary-800 to-primary-600 text-white">
      <div className="container text-center">
        <FadeIn className="mx-auto max-w-2xl space-y-6">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Prêt(e) à retrouver votre mobilité ?
          </h2>
          <p className="text-lg text-primary-50/90">
            Réservez votre première séance en ligne. Bilan complet, plan de traitement
            personnalisé et suivi attentif dès le premier rendez-vous.
          </p>
          <Link href="/book" className="inline-block">
            <Button size="lg" variant="secondary" className="bg-white text-primary-800 hover:bg-primary-50">
              Prendre rendez-vous maintenant <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
