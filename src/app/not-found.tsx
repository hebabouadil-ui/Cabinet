import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-50 px-4 text-center">
      <p className="font-display text-7xl font-semibold text-primary-200">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-primary-900">
        Page introuvable
      </h1>
      <p className="mt-2 max-w-md text-gray-600">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link href="/" className="mt-8">
        <Button>Retour à l&apos;accueil</Button>
      </Link>
    </div>
  );
}
