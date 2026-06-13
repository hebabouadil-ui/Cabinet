import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z
    .string()
    .min(8, "Numéro de téléphone invalide")
    .regex(/^[+\d\s().-]+$/, "Numéro de téléphone invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
});

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
});

export const appointmentSchema = z.object({
  serviceId: z.string().min(1, "Veuillez sélectionner un service"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Horaire invalide"),
  patientNote: z.string().max(1000).optional(),
});

export const rescheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Horaire invalide"),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().optional(),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
});

export const serviceSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug invalide (minuscules, chiffres, tirets)"),
  name: z.string().min(2, "Nom requis"),
  excerpt: z.string().min(10, "Résumé requis (10 caractères min.)"),
  description: z.string().min(20, "Description requise (20 caractères min.)"),
  duration: z.coerce.number().int().min(15).max(180),
  price: z.coerce.number().min(0),
  image: z.string().optional().or(z.literal("")),
  icon: z.string().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

export const availabilitySchema = z.object({
  slots: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      isActive: z.boolean().default(true),
    })
  ),
});

export const blockedDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().optional(),
});

export const settingsSchema = z.object({
  clinicName: z.string().min(2),
  tagline: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  mapEmbedUrl: z.string().optional(),
  slotDuration: z.coerce.number().int().min(15).max(120),
  bufferMinutes: z.coerce.number().int().min(0).max(60),
  maxAdvanceDays: z.coerce.number().int().min(7).max(365),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
});

export const testimonialSchema = z.object({
  name: z.string().min(2),
  role: z.string().optional(),
  content: z.string().min(10),
  rating: z.coerce.number().int().min(1).max(5),
  image: z.string().optional().or(z.literal("")),
  approved: z.boolean().default(false),
  order: z.coerce.number().int().default(0),
});

export const faqSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(5),
  order: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
});

export const contentBlockSchema = z.object({
  key: z.string().min(1),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  image: z.string().optional().or(z.literal("")),
});

export const adminNoteSchema = z.object({
  content: z.string().min(1, "La note ne peut pas être vide").max(5000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
