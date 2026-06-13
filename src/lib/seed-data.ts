import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const services = [
  {
    slug: "physiotherapy",
    name: "Kinésithérapie générale",
    excerpt:
      "Bilans complets et traitements personnalisés pour restaurer votre mobilité et soulager la douleur.",
    description:
      "Notre prise en charge en kinésithérapie générale commence par un bilan approfondi de votre posture, de votre mobilité et de vos antécédents. Nous élaborons ensuite un programme de soins sur mesure combinant thérapie manuelle, exercices thérapeutiques et éducation du patient pour des résultats durables.",
    duration: 45,
    price: 60,
    featured: true,
    order: 1,
    icon: "Activity",
  },
  {
    slug: "sports-rehabilitation",
    name: "Rééducation sportive",
    excerpt:
      "Retour au sport sécurisé après blessure grâce à des protocoles de rééducation progressifs.",
    description:
      "Spécialement conçue pour les sportifs amateurs et professionnels, notre rééducation sportive associe renforcement musculaire ciblé, travail proprioceptif et réathlétisation progressive. Objectif : un retour au terrain plus fort et sans récidive.",
    duration: 60,
    price: 75,
    featured: true,
    order: 2,
    icon: "Dumbbell",
  },
  {
    slug: "back-pain",
    name: "Traitement du mal de dos",
    excerpt:
      "Soulagement des lombalgies, hernies discales et douleurs chroniques du rachis.",
    description:
      "Lombalgie aiguë, hernie discale ou douleur chronique : nous combinons thérapie manuelle vertébrale, méthode McKenzie et renforcement du tronc pour traiter la cause et non seulement les symptômes.",
    duration: 45,
    price: 60,
    featured: true,
    order: 3,
    icon: "AlignCenter",
  },
  {
    slug: "neck-pain",
    name: "Traitement des cervicalgies",
    excerpt:
      "Prise en charge des douleurs cervicales, torticolis et céphalées de tension.",
    description:
      "Les douleurs cervicales liées au travail sur écran, au stress ou aux traumatismes (coup du lapin) répondent très bien à notre approche : mobilisations douces, relâchement myofascial et correction posturale.",
    duration: 45,
    price: 60,
    featured: false,
    order: 4,
    icon: "PersonStanding",
  },
  {
    slug: "post-surgery",
    name: "Rééducation post-opératoire",
    excerpt:
      "Récupération optimale après chirurgie orthopédique : genou, épaule, hanche, rachis.",
    description:
      "Après une ligamentoplastie, une prothèse ou une chirurgie du rachis, la rééducation conditionne le résultat final. Nous suivons les protocoles chirurgicaux tout en adaptant chaque séance à votre progression réelle.",
    duration: 60,
    price: 70,
    featured: true,
    order: 5,
    icon: "HeartPulse",
  },
  {
    slug: "manual-therapy",
    name: "Thérapie manuelle",
    excerpt:
      "Techniques manuelles avancées : mobilisations articulaires et relâchement myofascial.",
    description:
      "La thérapie manuelle orthopédique utilise des mobilisations et manipulations précises pour restaurer le jeu articulaire, diminuer la douleur et améliorer la fonction. Une approche fondée sur les preuves, adaptée à chaque patient.",
    duration: 45,
    price: 65,
    featured: false,
    order: 6,
    icon: "Hand",
  },
  {
    slug: "dry-needling",
    name: "Dry Needling",
    excerpt:
      "Puncture sèche des points gâchettes pour un soulagement rapide des tensions musculaires.",
    description:
      "Le dry needling consiste à insérer une aiguille fine et stérile dans les points gâchettes myofasciaux responsables de douleurs référées. Efficace sur les contractures rebelles, il s'intègre dans un plan de traitement global.",
    duration: 30,
    price: 50,
    featured: false,
    order: 7,
    icon: "Syringe",
  },
  {
    slug: "home-visits",
    name: "Soins à domicile",
    excerpt:
      "Kinésithérapie à domicile pour les patients à mobilité réduite ou en post-opératoire.",
    description:
      "Lorsque le déplacement au cabinet est difficile, nous venons à vous avec le matériel nécessaire. Idéal pour les personnes âgées, les suites opératoires immédiates ou les affections neurologiques.",
    duration: 60,
    price: 80,
    featured: false,
    order: 8,
    icon: "Home",
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
    title: "Dr. Heba Bouadil",
    subtitle: "Masseur-kinésithérapeute D.E. — Thérapie manuelle & sport",
    body: "Diplômée d'État avec une spécialisation en thérapie manuelle orthopédique et en rééducation du sportif, elle a accompagné plus de 3 000 patients, des suites opératoires aux athlètes de haut niveau. Formations certifiées : McKenzie (MDT), Dry Needling, Kinésiotaping, Rééducation vestibulaire.",
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
    update: {},
    create: {
      name: "Dr. Heba Bouadil",
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

  if ((await prisma.faq.count()) === 0) {
    await prisma.faq.createMany({ data: faqs });
  }

  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({ data: testimonials });
  }

  for (const block of contentBlocks) {
    await prisma.contentBlock.upsert({
      where: { key: block.key },
      update: {},
      create: block,
    });
  }

  // Default working hours: Monday-Friday 09:00-13:00 / 14:00-19:00, Saturday morning
  if ((await prisma.availability.count()) === 0) {
    const slots = [];
    for (let day = 1; day <= 5; day++) {
      slots.push({ dayOfWeek: day, startTime: "09:00", endTime: "13:00" });
      slots.push({ dayOfWeek: day, startTime: "14:00", endTime: "19:00" });
    }
    slots.push({ dayOfWeek: 6, startTime: "09:00", endTime: "13:00" });
    await prisma.availability.createMany({ data: slots });
  }

  await prisma.clinicSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      clinicName: "Cabinet Kiné Santé",
      tagline: "Kinésithérapie & rééducation",
      phone: "+212 6 00 00 00 00",
      email: "contact@cabinet-physio.com",
      whatsapp: "+212600000000",
      address: "12 Avenue de la Santé, Casablanca",
      slotDuration: 45,
      maxAdvanceDays: 60,
    },
  });

  console.log("Seed completed.");
}
