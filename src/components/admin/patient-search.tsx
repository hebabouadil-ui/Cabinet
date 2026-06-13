"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PatientSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query ? `/admin/patients?q=${encodeURIComponent(query)}` : "/admin/patients");
  };

  return (
    <form onSubmit={submit} className="flex max-w-md gap-2" role="search">
      <Input
        placeholder="Rechercher par nom, email ou téléphone..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Rechercher un patient"
      />
      <Button type="submit" variant="outline">
        <Search className="h-4 w-4" aria-hidden />
      </Button>
    </form>
  );
}
