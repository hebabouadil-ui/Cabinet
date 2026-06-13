"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
});

type Input_ = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Input_>({ resolver: zodResolver(schema) });

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="mb-2 font-display text-2xl font-semibold text-primary-900">
          Lien invalide
        </h1>
        <p className="text-sm text-gray-600">
          Ce lien de réinitialisation est invalide ou a expiré.
        </p>
        <Link href="/forgot-password" className="mt-6 inline-block">
          <Button variant="outline">Demander un nouveau lien</Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: Input_) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Lien invalide ou expiré.");
        return;
      }
      toast.success("Mot de passe mis à jour. Vous pouvez vous connecter.");
      router.push("/login");
    } catch {
      toast.error("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-primary-900">
        Nouveau mot de passe
      </h1>
      <p className="mb-6 text-sm text-gray-500">Choisissez votre nouveau mot de passe.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          Mettre à jour
        </Button>
      </form>
    </div>
  );
}
