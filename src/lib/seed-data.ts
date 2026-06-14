import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  CLINIC_NAME,
  CLINIC_TAGLINE,
  THERAPIST_NAME,
  THERAPIST_TITLE,
} from "./constants";

const services = [
  {
    slug: "reeducation-neurologie",
    name: "Rééducation en neurologie",
    excerpt:
      "Prise en charge des suites d'AVC, de la sclérose en plaques, de Parkinson et des atteintes neurologiques.",
    description:
      "La rééducation neurologique vise à récupérer la motricité, l'équilibre et l'autonomie après un accident vasculaire cérébral, un traumatisme ou dans le cadre d'une maladie neurologique (Parkinson, sclérose en plaques, neuropathies). Le programme associe travail de la marche, renforcement, coordination et stimulation fonctionnelle, adapté au rythme de chaque patient.",
    duration: 45,
    price: 0,
    featured: true,
    order: 1,
    icon: "Brain",
  },
  {
    slug: "reeducation-traumatologie-sport",
    name: "Rééducation en traumatologie et du sport",
    excerpt:
      "Récupération après entorse, fracture ou blessure sportive et retour à l'activité en toute sécurité.",
    description:
      "Destinée aux sportifs comme aux patients après un traumatisme, cette rééducation traite entorses, tendinites, déchirures musculaires et suites de fractures. Elle combine thérapie manuelle, renforcement progressif, travail proprioceptif et réathlétisation pour un retour au sport ou à la vie quotidienne sans récidive.",
    duration: 45,
    price: 0,
    featured: true,
    order: 2,
    icon: "Dumbbell",
  },
  {
    slug: "reeducation-rhumatologie",
    name: "Rééducation en rhumatologie",
    excerpt:
      "Soulagement de l'arthrose, des lombalgies et des douleurs articulaires chroniques.",
    description:
      "Arthrose, lombalgie, cervicalgie, tendinopathies ou maladies inflammatoires : la rééducation rhumatologique soulage la douleur, entretient la mobilité articulaire et renforce les muscles stabilisateurs. L'objectif est d'améliorer durablement le confort et la qualité de vie au quotidien.",
    duration: 45,
    price: 0,
    featured: true,
    order: 3,
    icon: "Activity",
  },
  {
    slug: "reeducation-respiratoire",
    name: "Rééducation respiratoire (adultes et enfants)",
    excerpt:
      "Kinésithérapie respiratoire pour bronchiolite, encombrement et affections pulmonaires chroniques.",
    description:
      "La kinésithérapie respiratoire aide à désencombrer les voies aériennes et à améliorer la capacité respiratoire. Adaptée aux adultes (BPCO, post-opératoire, asthme) comme aux enfants et nourrissons (bronchiolite, encombrement), elle utilise des techniques douces et sécurisées.",
    duration: 30,
    price: 0,
    featured: false,
    order: 4,
    icon: "Wind",
  },
  {
    slug: "reeducation-orthopedie",
    name: "Rééducation en orthopédie",
    excerpt:
      "Récupération après chirurgie ou traumatisme orthopédique : prothèses, ligamentoplasties, fractures.",
    description:
      "Après une prothèse de hanche ou de genou, une ligamentoplastie ou une chirurgie du rachis, la rééducation orthopédique conditionne la qualité de la récupération. Nous suivons les protocoles chirurgicaux tout en adaptant chaque séance à votre progression : mobilité, renforcement et reprise des appuis.",
    duration: 45,
    price: 0,
    featured: true,
    order: 5,
    icon: "Bone",
  },
  {
    slug: "massage-therapeutique",
    name: "Massage thérapeutique professionnel",
    excerpt:
      "Massages thérapeutiques pour relâcher les tensions, soulager la douleur et favoriser la récupération.",
    description:
      "Le massage thérapeutique professionnel agit sur les contractures, les tensions musculaires et la circulation. Il complète la rééducation en réduisant la douleur, en améliorant la souplesse des tissus et en favorisant une détente profonde.",
    duration: 30,
    price: 0,
    featured: false,
    order: 6,
    icon: "Hand",
  },
  {
    slug: "physiotherapie",
    name: "Physiothérapie",
    excerpt:
      "Électrothérapie, ultrasons et physiothérapie instrumentale pour accélérer la guérison.",
    description:
      "La physiothérapie utilise des agents physiques — électrothérapie, ultrasons, ondes, chaleur et froid — pour diminuer la douleur, réduire l'inflammation et stimuler la cicatrisation des tissus. Elle s'intègre dans un plan de traitement global pour des résultats optimaux.",
    duration: 30,
    price: 0,
    featured: false,
    order: 7,
    icon: "Stethoscope",
  },
  {
    slug: "pressotherapie",
    name: "Pressothérapie",
    excerpt:
      "Drainage par compression pour les jambes lourdes, l'œdème et la récupération circulatoire.",
    description:
      "La pressothérapie applique une compression pneumatique progressive sur les membres pour stimuler la circulation veineuse et lymphatique. Elle soulage les jambes lourdes, réduit les œdèmes et favorise la récupération après l'effort ou une chirurgie.",
    duration: 30,
    price: 0,
    featured: false,
    order: 8,
    icon: "Waves",
  },
];

const faqs = [
  {
    question: "Ai-je besoin d'une ordonnance pour consulter ?",
    answer:
      "Une prescription médicale est nécessaire pour le remboursement par l'assurance maladie. Vous pouvez toutefois consulter en accès direct pour un bilan ou des séances non remboursées.",
    order: 1,
  },
  {
    question: "Combien de séances seront nécessaires ?",
    answer:
      "Cela dépend de votre pathologie. Après le bilan initial, nous vous proposons un plan de traitement avec un nombre de séances estimé, réévalué régulièrement selon vos progrès.",
    order: 2,
  },
  {
    question: "Que dois-je apporter à ma première séance ?",
    answer:
      "Votre ordonnance, votre carte vitale, vos examens d'imagerie récents (radio, IRM, échographie) et une tenue confortable permettant d'accéder à la zone à traiter.",
    order: 3,
  },
  {
    question: "Puis-je annuler ou reporter un rendez-vous ?",
    answer:
      "Oui, directement depuis votre espace patient jusqu'à 24 heures avant la séance. Au-delà, merci de nous contacter par téléphone ou WhatsApp.",
    order: 4,
  },
  {
    question: "Les séances sont-elles remboursées ?",
    answer:
      "Les séances prescrites par un médecin sont prises en charge par l'assurance maladie et votre mutuelle selon les conditions habituelles. Nous pratiquons le tiers payant.",
    order: 5,
  },
];

const testimonials = [
  {
    name: "Sophie Martin",
    role: "Patiente — lombalgie chronique",
    content:
      "Après des années de mal de dos, j'ai enfin trouvé un kiné qui prend le temps de comprendre. En dix séances, ma douleur a quasiment disparu et j'ai appris à entretenir mon dos.",
    rating: 5,
    approved: true,
    order: 1,
  },
  {
    name: "Karim Benali",
    role: "Footballeur amateur",
    content:
      "Rééducation après rupture des ligaments croisés : suivi rigoureux, exercices progressifs, et je suis revenu sur le terrain en pleine confiance. Je recommande à 100 %.",
    rating: 5,
    approved: true,
    order: 2,
  },
  {
    name: "Claire Dubois",
    role: "Patiente — post-opératoire épaule",
    content:
      "Un cabinet moderne, une prise de rendez-vous en ligne très pratique et surtout un praticien à l'écoute. Ma récupération après l'opération de l'épaule a dépassé les attentes du chirurgien.",
    rating: 5,
    approved: true,
    order: 3,
  },
];

const contentBlocks = [
  {
    key: "hero",
    title: "Retrouvez le mouvement,\nretrouvez votre vie",
    subtitle:
      "Cabinet de kinésithérapie moderne dédié au soulagement de la douleur, à la rééducation et à la performance. Prenez rendez-vous en ligne en moins d'une minute.",
  },
  {
    key: "about-intro",
    title: "Une approche humaine et fondée sur les preuves",
    body: "Depuis plus de 12 ans, notre cabinet accompagne les patients de tous âges dans leur rééducation. Chaque traitement repose sur un bilan précis, des techniques validées scientifiquement et une relation de confiance.",
  },
  {
    key: "therapist",
    title: THERAPIST_NAME,
    subtitle: THERAPIST_TITLE,
    body: "Diplômé d'État avec une spécialisation en thérapie manuelle orthopédique et en rééducation du sportif, il a accompagné plus de 3 000 patients, des suites opératoires aux athlètes de haut niveau. Formations certifiées : McKenzie (MDT), Dry Needling, Kinésiotaping, Rééducation vestibulaire.",
  },
];

/**
 * Idempotent: safe to run multiple times. Creates the admin account,
 * default services, FAQs, testimonials, working hours and settings.
 */
export async function runSeed(prisma: PrismaClient) {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD ?? "Admin123!",
    12
  );

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@cabinet-physio.com" },
    update: { name: THERAPIST_NAME },
    create: {
      name: THERAPIST_NAME,
      email: process.env.ADMIN_EMAIL ?? "admin@cabinet-physio.com",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }

  // Remove demo services that are no longer part of the real offer
  const keepSlugs = services.map((s) => s.slug);
  const stale = await prisma.service.findMany({
    where: { slug: { notIn: keepSlugs } },
    include: { _count: { select: { appointments: true } } },
  });
  for (const s of stale) {
    if (s._count.appointments === 0) {
      await prisma.service.delete({ where: { id: s.id } });
    } else {
      await prisma.service.update({ where: { id: s.id }, data: { active: false } });
    }
  }

  if ((await prisma.faq.count()) === 0) {
    await prisma.faq.createMany({ data: faqs });
  }

  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({ data: testimonials });
  }

  for (const block of contentBlocks) {
    await prisma.contentBlock.upsert({
      where: { key: block.key },
      // Refresh the practitioner's name/title/bio on re-run, but never the
      // image (which the admin sets from the panel)
      update:
        block.key === "therapist"
          ? { title: block.title, subtitle: block.subtitle, body: block.body }
          : {},
      create: block,
    });
  }

  // Real opening hours (Safi). Reset so a re-run reflects the schedule.
  const hours = [
    { dayOfWeek: 1, startTime: "10:00", endTime: "12:30" },
    { dayOfWeek: 1, startTime: "14:00", endTime: "17:30" },
    { dayOfWeek: 2, startTime: "10:00", endTime: "12:30" },
    { dayOfWeek: 2, startTime: "14:00", endTime: "17:30" },
    { dayOfWeek: 3, startTime: "10:00", endTime: "12:30" },
    { dayOfWeek: 3, startTime: "14:00", endTime: "17:30" },
    { dayOfWeek: 4, startTime: "10:00", endTime: "12:30" },
    { dayOfWeek: 4, startTime: "14:00", endTime: "17:30" },
    { dayOfWeek: 5, startTime: "10:00", endTime: "12:30" },
    { dayOfWeek: 5, startTime: "14:30", endTime: "17:30" },
    { dayOfWeek: 6, startTime: "10:00", endTime: "13:00" },
  ];
  await prisma.$transaction([
    prisma.availability.deleteMany(),
    prisma.availability.createMany({ data: hours }),
  ]);

  const realSettings = {
    clinicName: CLINIC_NAME,
    tagline: CLINIC_TAGLINE,
    phone: "06 06 19 74 71",
    email: "",
    whatsapp: "+212606197471",
    address: "34 Av. Moulay Abdellah, Safi 46000",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=32.282429,-9.23572&z=16&hl=fr&output=embed",
    facebookUrl:
      "https://web.facebook.com/p/Cabinet-ibn-sina-100057121523022/",
    slotDuration: 30,
    maxAdvanceDays: 60,
  };
  await prisma.clinicSettings.upsert({
    where: { id: "singleton" },
    update: realSettings,
    create: { id: "singleton", ...realSettings },
  });

  console.log("Seed completed.");
}
