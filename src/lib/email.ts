import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { CLINIC_NAME } from "@/lib/constants";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM ?? `${CLINIC_NAME} <onboarding@resend.dev>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function layout(title: string, content: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f0fdfa;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#0f766e;padding:24px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;">${CLINIC_NAME}</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 16px;color:#134e4a;font-size:18px;">${title}</h2>
          <div style="color:#374151;font-size:15px;line-height:1.6;">${content}</div>
        </td></tr>
        <tr><td style="padding:16px 32px;background:#f8fafc;color:#94a3b8;font-size:12px;">
          Cet email vous a été envoyé par le ${CLINIC_NAME}. Merci de ne pas y répondre directement.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string) {
  return `<p style="margin:24px 0;"><a href="${href}" style="background:#0f766e;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">${label}</a></p>`;
}

async function send(opts: {
  to: string;
  subject: string;
  html: string;
  userId?: string;
  appointmentId?: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      type: "EMAIL",
      subject: opts.subject,
      body: opts.html,
      userId: opts.userId,
      appointmentId: opts.appointmentId,
    },
  });

  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipping "${opts.subject}" to ${opts.to}`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  } catch (error) {
    console.error("[email] send failed:", error);
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "FAILED" },
    });
  }
}

export async function sendVerificationEmail(opts: {
  to: string;
  name: string;
  token: string;
  userId: string;
}) {
  const url = `${APP_URL}/verify-email?token=${opts.token}`;
  await send({
    to: opts.to,
    userId: opts.userId,
    subject: "Confirmez votre adresse email",
    html: layout(
      `Bienvenue ${opts.name} !`,
      `<p>Merci de votre inscription. Veuillez confirmer votre adresse email pour activer votre compte et prendre rendez-vous en ligne.</p>
       ${button(url, "Confirmer mon email")}
       <p style="color:#94a3b8;font-size:13px;">Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>`
    ),
  });
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  token: string;
  userId: string;
}) {
  const url = `${APP_URL}/reset-password?token=${opts.token}`;
  await send({
    to: opts.to,
    userId: opts.userId,
    subject: "Réinitialisation de votre mot de passe",
    html: layout(
      "Réinitialisation du mot de passe",
      `<p>Bonjour ${opts.name},</p>
       <p>Vous avez demandé la réinitialisation de votre mot de passe. Ce lien est valable 1 heure.</p>
       ${button(url, "Choisir un nouveau mot de passe")}
       <p style="color:#94a3b8;font-size:13px;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>`
    ),
  });
}

export async function sendAppointmentEmail(opts: {
  to: string;
  name: string;
  userId?: string;
  appointmentId: string;
  serviceName: string;
  date: string;
  time: string;
  kind: "requested" | "confirmed" | "rejected" | "cancelled" | "rescheduled" | "reminder";
}) {
  const titles: Record<typeof opts.kind, string> = {
    requested: "Demande de rendez-vous reçue",
    confirmed: "Votre rendez-vous est confirmé",
    rejected: "Votre demande de rendez-vous n'a pas pu être acceptée",
    cancelled: "Votre rendez-vous a été annulé",
    rescheduled: "Votre rendez-vous a été reporté",
    reminder: "Rappel : rendez-vous demain",
  };

  const bodies: Record<typeof opts.kind, string> = {
    requested:
      "Nous avons bien reçu votre demande de rendez-vous. Vous recevrez une confirmation dès qu'elle sera validée par le cabinet.",
    confirmed: "Votre rendez-vous est confirmé. Nous nous réjouissons de vous accueillir.",
    rejected:
      "Malheureusement, ce créneau n'est plus disponible. Veuillez choisir un autre horaire depuis votre espace patient.",
    cancelled: "Votre rendez-vous a bien été annulé.",
    rescheduled: "Votre rendez-vous a été déplacé. Voici les nouveaux détails :",
    reminder: "Petit rappel pour votre rendez-vous de demain :",
  };

  await send({
    to: opts.to,
    userId: opts.userId,
    appointmentId: opts.appointmentId,
    subject: titles[opts.kind],
    html: layout(
      titles[opts.kind],
      `<p>Bonjour ${opts.name},</p>
       <p>${bodies[opts.kind]}</p>
       <table style="margin:16px 0;border-collapse:collapse;">
         <tr><td style="padding:6px 16px 6px 0;color:#94a3b8;">Soin</td><td style="font-weight:bold;color:#134e4a;">${opts.serviceName}</td></tr>
         <tr><td style="padding:6px 16px 6px 0;color:#94a3b8;">Date</td><td style="font-weight:bold;color:#134e4a;">${opts.date}</td></tr>
         <tr><td style="padding:6px 16px 6px 0;color:#94a3b8;">Heure</td><td style="font-weight:bold;color:#134e4a;">${opts.time}</td></tr>
       </table>
       ${button(`${APP_URL}/account`, "Gérer mes rendez-vous")}`
    ),
  });
}

export async function sendContactEmail(opts: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const settings = await prisma.clinicSettings.findUnique({
    where: { id: "singleton" },
  });
  const to = settings?.email ?? process.env.ADMIN_EMAIL;
  if (!to) return;

  await send({
    to,
    subject: `Nouveau message de ${opts.name} (formulaire de contact)`,
    html: layout(
      "Nouveau message de contact",
      `<p><strong>Nom :</strong> ${opts.name}</p>
       <p><strong>Email :</strong> ${opts.email}</p>
       <p><strong>Téléphone :</strong> ${opts.phone ?? "Non renseigné"}</p>
       <p><strong>Message :</strong></p>
       <p style="background:#f8fafc;padding:16px;border-radius:8px;">${opts.message.replace(/\n/g, "<br/>")}</p>`
    ),
  });
}
