"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";
import { forgotPasswordSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Input_ = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Input_>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: Input_) => {
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSent(true);
    } catch {
      toast.error("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <MailCheck className="mx-auto mb-4 h-12 w-12 text-primary-600" aria-hidden />
        <h1 className="mb-2 font-display text-2xl font-semibold text-primary-900">
          Email envoyé
        </h1>
        <p className="text-sm text-gray-600">
          Si un compte existe avec cette adresse, vous recevrez un lien de
          réinitialisation valable 1 heure.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-primary-900">
        Mot de passe oublié
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Entrez votre email pour recevoir un lien de réinitialisation.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Envoyer le lien
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="font-medium text-primary-700 hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
