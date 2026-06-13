import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Vérification de l'email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let success = false;
  if (token) {
    const user = await prisma.user.findUnique({ where: { verifyToken: token } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date(), verifyToken: null },
      });
      success = true;
    }
  }

  return (
    <div className="text-center">
      {success ? (
        <>
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-600" aria-hidden />
          <h1 className="mb-2 font-display text-2xl font-semibold text-primary-900">
            Email confirmé !
          </h1>
          <p className="text-sm text-gray-600">
            Votre compte est activé. Vous pouvez maintenant vous connecter et prendre
            rendez-vous.
          </p>
          <Link href="/login" className="mt-6 inline-block">
            <Button>Se connecter</Button>
          </Link>
        </>
      ) : (
        <>
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" aria-hidden />
          <h1 className="mb-2 font-display text-2xl font-semibold text-primary-900">
            Lien invalide
          </h1>
          <p className="text-sm text-gray-600">
            Ce lien de vérification est invalide ou a déjà été utilisé.
          </p>
          <Link href="/login" className="mt-6 inline-block">
            <Button variant="outline">Aller à la connexion</Button>
          </Link>
        </>
      )}
    </div>
  );
}
