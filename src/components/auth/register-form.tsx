"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [verified, setVerified] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Une erreur est survenue.");
        return;
      }
      setVerified(!!json.verified);
      setDone(true);
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center">
        <MailCheck className="mx-auto mb-4 h-12 w-12 text-primary-600" aria-hidden />
        <h1 className="mb-2 font-display text-2xl font-semibold text-primary-900">
          {verified ? "Compte créé !" : "Vérifiez votre boîte mail"}
        </h1>
        <p className="text-sm text-gray-600">
          {verified
            ? "Votre compte est activé. Vous pouvez vous connecter et prendre rendez-vous."
            : "Nous vous avons envoyé un lien de confirmation. Cliquez dessus pour activer votre compte, puis connectez-vous."}
        </p>
        <Link href="/login" className="mt-6 inline-block">
          <Button>Se connecter</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-primary-900">
        Créer un compte
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Inscrivez-vous pour réserver vos séances en ligne.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Nom complet</Label>
          <Input id="name" autoComplete="name" {...register("name")} />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone (WhatsApp)</Label>
          <Input id="phone" type="tel" placeholder="+212 6 ..." {...register("phone")} />
          {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Créer mon compte
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-medium text-primary-700 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
