import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cette adresse email." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const verifyToken = randomBytes(32).toString("hex");

    // When transactional email isn't configured, verification links can't be
    // delivered — so activate the account immediately instead of locking the
    // patient out of booking.
    const emailEnabled = !!process.env.RESEND_API_KEY;

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone,
        password: hashed,
        role: "PATIENT",
        verifyToken: emailEnabled ? verifyToken : null,
        emailVerified: emailEnabled ? null : new Date(),
        patient: { create: {} },
      },
    });

    if (emailEnabled) {
      await sendVerificationEmail({
        to: normalizedEmail,
        name,
        token: verifyToken,
        userId: user.id,
      });
    }

    return NextResponse.json({ ok: true, verified: !emailEnabled }, { status: 201 });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
