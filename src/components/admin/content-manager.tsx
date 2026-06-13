"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { cn } from "@/lib/utils";

type Block = {
  id: string;
  key: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image: string | null;
};

type TestimonialItem = {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  approved: boolean;
  order: number;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
};

const BLOCK_LABELS: Record<string, string> = {
  hero: "Section d'accueil (hero)",
  "about-intro": "Introduction « À propos »",
  therapist: "Présentation de la praticienne",
};

const tabTrigger =
  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors data-[state=active]:bg-primary-700 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600";

export function ContentManager({
  blocks,
  testimonials,
  faqs,
}: {
  blocks: Block[];
  testimonials: TestimonialItem[];
  faqs: FaqItem[];
}) {
  return (
    <Tabs.Root defaultValue="blocks">
      <Tabs.List className="mb-6 flex gap-2" aria-label="Sections de contenu">
        <Tabs.Trigger value="blocks" className={tabTrigger}>
          Pages du site
        </Tabs.Trigger>
        <Tabs.Trigger value="testimonials" className={tabTrigger}>
          Témoignages
        </Tabs.Trigger>
        <Tabs.Trigger value="faqs" className={tabTrigger}>
          FAQ
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="blocks">
        <BlocksTab blocks={blocks} />
      </Tabs.Content>
      <Tabs.Content value="testimonials">
        <TestimonialsTab testimonials={testimonials} />
      </Tabs.Content>
      <Tabs.Content value="faqs">
        <FaqsTab faqs={faqs} />
      </Tabs.Content>
    </Tabs.Root>
  );
}

function BlocksTab({ blocks }: { blocks: Block[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, Block>>(
    Object.fromEntries(blocks.map((b) => [b.key, { ...b }]))
  );
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const save = async (key: string) => {
    setSavingKey(key);
    try {
      const draft = drafts[key];
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          title: draft.title ?? "",
          subtitle: draft.subtitle ?? "",
          body: draft.body ?? "",
          image: draft.image ?? "",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erreur lors de l'enregistrement.");
        return;
      }
      toast.success("Section mise à jour.");
      router.refresh();
    } finally {
      setSavingKey(null);
    }
  };

  const set = (key: string, patch: Partial<Block>) =>
    setDrafts((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {Object.values(drafts).map((block) => (
        <Card key={block.key}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>{BLOCK_LABELS[block.key] ?? block.key}</CardTitle>
            <Button size="sm" onClick={() => save(block.key)} disabled={savingKey === block.key}>
              {savingKey === block.key ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              Enregistrer
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Textarea
                rows={2}
                value={block.title ?? ""}
                onChange={(e) => set(block.key, { title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Sous-titre</Label>
              <Textarea
                rows={2}
                value={block.subtitle ?? ""}
                onChange={(e) => set(block.key, { subtitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Texte</Label>
              <Textarea
                rows={4}
                value={block.body ?? ""}
                onChange={(e) => set(block.key, { body: e.target.value })}
              />
            </div>
            <ImageUploadField
              label="Image"
              folder="content"
              value={block.image ?? ""}
              onChange={(url) => set(block.key, { image: url })}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TestimonialsTab({ testimonials }: { testimonials: TestimonialItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", role: "", content: "", rating: 5 });

  const add = async () => {
    setAdding(true);
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, approved: true, order: testimonials.length + 1 }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erreur.");
        return;
      }
      toast.success("Témoignage ajouté.");
      setDraft({ name: "", role: "", content: "", rating: 5 });
      router.refresh();
    } finally {
      setAdding(false);
    }
  };

  const toggle = async (t: TestimonialItem) => {
    setBusy(t.id);
    try {
      await fetch(`/api/admin/testimonials/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: t.name,
          role: t.role ?? "",
          content: t.content,
          rating: t.rating,
          approved: !t.approved,
          order: t.order,
        }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    setBusy(id);
    try {
      await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      toast.success("Témoignage supprimé.");
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un témoignage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Rôle / contexte</Label>
            <Input
              placeholder="ex: Patiente — lombalgie"
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Témoignage</Label>
            <Textarea
              rows={4}
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Note (1–5)</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={draft.rating}
              onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
            />
          </div>
          <Button onClick={add} disabled={!draft.name || !draft.content || adding} className="w-full">
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-4 w-4" aria-hidden />
            )}
            Ajouter
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4 lg:col-span-2">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <p className="font-medium text-primary-900">{t.name}</p>
                <Badge variant={t.approved ? "default" : "secondary"}>
                  {t.approved ? "Publié" : "Masqué"}
                </Badge>
                <span className="text-xs text-amber-500">{"★".repeat(t.rating)}</span>
              </div>
              {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
              <p className="mt-2 text-sm text-gray-700">{t.content}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggle(t)}
                disabled={busy === t.id}
              >
                {t.approved ? "Masquer" : "Publier"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(t.id)}
                disabled={busy === t.id}
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4 text-red-500" aria-hidden />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqsTab({ faqs }: { faqs: FaqItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ question: "", answer: "" });

  const add = async () => {
    setAdding(true);
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, active: true, order: faqs.length + 1 }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erreur.");
        return;
      }
      toast.success("Question ajoutée.");
      setDraft({ question: "", answer: "" });
      router.refresh();
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: string) => {
    setBusy(id);
    try {
      await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      toast.success("Question supprimée.");
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              value={draft.question}
              onChange={(e) => setDraft({ ...draft, question: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Réponse</Label>
            <Textarea
              rows={4}
              value={draft.answer}
              onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
            />
          </div>
          <Button
            onClick={add}
            disabled={!draft.question || !draft.answer || adding}
            className="w-full"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-4 w-4" aria-hidden />
            )}
            Ajouter
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4 lg:col-span-2">
        {faqs.map((f) => (
          <div
            key={f.id}
            className={cn(
              "flex items-start justify-between gap-4 rounded-2xl border bg-white p-5 shadow-sm",
              !f.active && "opacity-60"
            )}
          >
            <div>
              <p className="font-medium text-primary-900">{f.question}</p>
              <p className="mt-1 text-sm text-gray-600">{f.answer}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => remove(f.id)}
              disabled={busy === f.id}
              aria-label="Supprimer"
            >
              <Trash2 className="h-4 w-4 text-red-500" aria-hidden />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
