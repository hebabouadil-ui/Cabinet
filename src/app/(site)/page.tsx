import { prisma } from "@/lib/prisma";
import {
  Hero,
  ServicesSection,
  TherapistSection,
  BenefitsSection,
  TestimonialsSection,
  FaqSection,
  CtaSection,
} from "@/components/site/home-sections";

export const revalidate = 300;

export default async function HomePage() {
  // Fallbacks keep the build green when the database is empty or unreachable
  const [services, testimonials, faqs, blocks] = await Promise.all([
    prisma.service
      .findMany({ where: { active: true }, orderBy: { order: "asc" }, take: 8 })
      .catch(() => []),
    prisma.testimonial
      .findMany({ where: { approved: true }, orderBy: { order: "asc" }, take: 3 })
      .catch(() => []),
    prisma.faq
      .findMany({ where: { active: true }, orderBy: { order: "asc" } })
      .catch(() => []),
    prisma.contentBlock
      .findMany({ where: { key: { in: ["hero", "therapist"] } } })
      .catch(() => []),
  ]);

  const heroBlock = blocks.find((b) => b.key === "hero") ?? null;
  const therapistBlock = blocks.find((b) => b.key === "therapist") ?? null;

  return (
    <>
      <Hero block={heroBlock} />
      <ServicesSection services={services} />
      <TherapistSection block={therapistBlock} />
      <BenefitsSection />
      <TestimonialsSection testimonials={testimonials} />
      <FaqSection faqs={faqs} />
      <CtaSection />
    </>
  );
}
